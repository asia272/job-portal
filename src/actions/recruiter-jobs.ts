"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRecruiter } from "@/lib/recruiter";
import { jobSchema, toFieldErrors } from "@/lib/validations";
import type { FormState } from "@/lib/form-state";

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

    // The application must belong to one of THIS recruiter's jobs
    const updated = await prisma.application.updateMany({
        where: { id: id.data, job: { recruiterId: recruiter.id } },
        data: { status: st.data },
    });
    if (updated.count === 0) return { error: "Application not found" };

    revalidatePath("/recruiter/applications");
    revalidatePath("/recruiter/dashboard");
    revalidatePath("/recruiter/jobs", "layout");
    revalidatePath("/my-applications"); // candidate sees the new status
    return { success: true };
}