import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCandidate } from "@/lib/candidate";
import { auth } from "@clerk/nextjs/server";
import ApplyButton, { ApplyState } from "@/components/apply-button";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const job = await prisma.job.findUnique({
        where: { id },
        include: { recruiter: { select: { id: true, companyName: true, companyLogoUrl: true } } },
    });
    if (!job || job.status !== "ACTIVE") notFound();

    const { userId } = await auth();
    const candidate = userId ? await getCurrentCandidate() : null;

    let state: ApplyState = "guest";
    if (candidate) {
        const existing = await prisma.application.findUnique({
            where: { candidateId_jobId: { candidateId: candidate.id, jobId: job.id } },
            select: { id: true },
        });
        state = existing ? "applied" : candidate.resumeUrl ? "can-apply" : "no-resume";
    }

    const moreJobs = await prisma.job.findMany({
        where: { recruiterId: job.recruiterId, status: "ACTIVE", id: { not: job.id } },
        take: 3,
        orderBy: { createdAt: "desc" },
    });

    // Render the header card (logo, title, company, location, level, CTC, posted time),
    // description, responsibilities (<ol>), skills (<ol>),
    // <ApplyButton jobId={job.id} state={state} /> in the header and at the bottom,
    // and the "More jobs from {company}" column using moreJobs.
}