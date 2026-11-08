"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRecruiter } from "@/lib/recruiter";
import { jobSchema, toFieldErrors } from "@/lib/validations";
import type { FormState } from "@/lib/form-state";
import { after } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { sendApplicationStatusEmail } from "@/lib/email";

type ActionResult = { error?: string; success?: boolean };

const idSchema = z.string().min(1).max(40);
const jobStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);
const applicationStatusSchema = z.enum(["PENDING", "ACCEPTED", "REJECTED"]);

const FIELDS = [
    "title",
    "description",
    "category",
    "level",
    "location",
    "salaryMin",
    "salaryMax",
    "responsibilities",
    "skills",
] as const;

const splitLines = (s: string) =>
    s.split("\n").map((l) => l.trim()).filter(Boolean);

function parseJobForm(formData: FormData) {
    const values = Object.fromEntries(
        FIELDS.map((k) => [k, String(formData.get(k) ?? "")])
    ) as Record<(typeof FIELDS)[number], string>;

    const parsed = jobSchema.safeParse({
        ...values,
        responsibilities: splitLines(values.responsibilities),
        skills: splitLines(values.skills),
    });

    if (!parsed.success) {
        const state: FormState = {
            fieldErrors: toFieldErrors(parsed.error.issues),
            values,
        };
        return { ok: false as const, state };
    }
    return { ok: true as const, data: parsed.data, values };
}

function revalidateJobPages(jobId?: string) {
    revalidatePath("/");
    revalidatePath("/recruiter/jobs");
    revalidatePath("/recruiter/dashboard");
    if (jobId) revalidatePath(`/jobs/${jobId}`);
}

// ---------------- CREATE ----------------
export async function createJob(_prev: FormState, formData: FormData): Promise<FormState> {
    const recruiter = await requireRecruiter();

    const result = parseJobForm(formData);
    if (!result.ok) return result.state;
    const { data, values } = result;
    const rl = await rateLimit("createJob", recruiter.id);
    if (!rl.ok) return { error: rl.message, values };
    try {
        await prisma.job.create({
            data: {
                ...data,
                salaryMin: data.salaryMin ?? null,
                salaryMax: data.salaryMax ?? null,
                recruiterId: recruiter.id, // always from the session, never from the form
            },
        });
    } catch (e) {
        console.error("createJob failed:", e);
        return { error: "Could not post the job. Please try again.", values };
    }

    revalidateJobPages();
    redirect("/recruiter/jobs");
}

// ---------------- UPDATE ----------------
// Used as updateJob.bind(null, jobId) so the form passes (prev, formData)
export async function updateJob(
    jobId: string,
    _prev: FormState,
    formData: FormData
): Promise<FormState> {
    const recruiter = await requireRecruiter();

    const id = idSchema.safeParse(jobId);
    if (!id.success) return { error: "Invalid job" };

    const result = parseJobForm(formData);
    if (!result.ok) return result.state;
    const { data, values } = result;

    try {
        // Ownership check lives in the WHERE clause
        const updated = await prisma.job.updateMany({
            where: { id: id.data, recruiterId: recruiter.id },
            data: {
                ...data,
                salaryMin: data.salaryMin ?? null, // null clears the value
                salaryMax: data.salaryMax ?? null,
            },
        });
        if (updated.count === 0) return { error: "Job not found", values };
    } catch (e) {
        console.error("updateJob failed:", e);
        return { error: "Could not save changes. Please try again.", values };
    }

    revalidateJobPages(id.data);
    redirect("/recruiter/jobs");
}

// ---------------- ACTIVE / INACTIVE ----------------
export async function setJobStatus(
    jobId: string,
    status: "ACTIVE" | "INACTIVE"
): Promise<ActionResult> {
    const recruiter = await requireRecruiter();

    const id = idSchema.safeParse(jobId);
    const st = jobStatusSchema.safeParse(status);
    if (!id.success || !st.success) return { error: "Invalid request" };

    const updated = await prisma.job.updateMany({
        where: { id: id.data, recruiterId: recruiter.id },
        data: { status: st.data },
    });
    if (updated.count === 0) return { error: "Job not found" };

    revalidateJobPages(id.data);
    return { success: true };
}

// ---------------- DELETE ----------------
export async function deleteJob(jobId: string): Promise<ActionResult> {
    const recruiter = await requireRecruiter();

    const id = idSchema.safeParse(jobId);
    if (!id.success) return { error: "Invalid request" };

    // Applications are removed too (onDelete: Cascade in the schema)
    const deleted = await prisma.job.deleteMany({
        where: { id: id.data, recruiterId: recruiter.id },
    });
    if (deleted.count === 0) return { error: "Job not found" };

    revalidateJobPages(id.data);
    revalidatePath("/recruiter/applications");
    revalidatePath("/my-applications");
    return { success: true };
}

// ---------------- ACCEPT / REJECT ----------------
export async function updateApplicationStatus(
    applicationId: string,
    status: "PENDING" | "ACCEPTED" | "REJECTED"
): Promise<ActionResult> {
    const recruiter = await requireRecruiter();

    const id = idSchema.safeParse(applicationId);
    const st = applicationStatusSchema.safeParse(status);
    if (!id.success || !st.success) return { error: "Invalid request" };

    // Load it WITH the ownership check (must belong to one of this recruiter's jobs)
    const application = await prisma.application.findFirst({
        where: { id: id.data, job: { recruiterId: recruiter.id } },
        select: {
            status: true,
            candidate: { select: { email: true, name: true } },
            job: { select: { title: true } },
        },
    });
    if (!application) return { error: "Application not found" };
    if (application.status === st.data) return { success: true };

    // Only the request that really changes the status gets count 1,
    // so a double click can never send two emails
    const updated = await prisma.application.updateMany({
        where: {
            id: id.data,
            job: { recruiterId: recruiter.id },
            status: { not: st.data },
        },
        data: { status: st.data },
    });

    if (updated.count === 1 && st.data !== "PENDING") {
        const decision = st.data; // "ACCEPTED" | "REJECTED"
        // Sent after the response, so the recruiter's click stays fast.
        // A failed email never undoes the status change.
        after(async () => {
            try {
                await sendApplicationStatusEmail({
                    to: application.candidate.email,
                    name: application.candidate.name,
                    jobTitle: application.job.title,
                    company: recruiter.companyName,
                    status: decision,
                });
            } catch (e) {
                console.error("status email failed:", e);
            }
        });
    }

    revalidatePath("/recruiter/applications");
    revalidatePath("/recruiter/dashboard");
    revalidatePath("/recruiter/jobs", "layout");
    revalidatePath("/my-applications");
    return { success: true };
}