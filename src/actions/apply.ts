"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentCandidate } from "@/lib/candidate";

export async function applyToJob(rawJobId: string) {
    const jobId = z.string().cuid().safeParse(rawJobId);
    if (!jobId.success) return { error: "Invalid job" };

    const candidate = await getCurrentCandidate();
    if (!candidate) return { error: "Please login to apply for this job" };
    if (!candidate.resumeUrl) return { error: "Please upload your resume before applying" };

    const job = await prisma.job.findUnique({ where: { id: jobId.data }, select: { status: true } });
    if (!job || job.status !== "ACTIVE") return { error: "This job is no longer available" };

    try {
        await prisma.application.create({
            data: { candidateId: candidate.id, jobId: jobId.data, resumeUrl: candidate.resumeUrl },
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            return { error: "You have already applied for this job" };
        }
        throw e;
    }

    revalidatePath(`/jobs/${jobId.data}`);
    revalidatePath("/my-applications");
    return { success: true };
}