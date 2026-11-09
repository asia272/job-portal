import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRecruiter } from "@/lib/recruiter";
import RecruiterApplicationsTable from "@/components/recruiter-applications-table";
import { SectionLoader } from "@/components/loader";

export default function JobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<SectionLoader />}>
            <Content params={params} />
        </Suspense>
    );
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
    const recruiter = await requireRecruiter();
    const { id } = await params;

    const job = await prisma.job.findFirst({
        where: { id, recruiterId: recruiter.id },
        select: { id: true, title: true },
    });
    if (!job) notFound();

    const applications = await prisma.application.findMany({
        where: { jobId: job.id },
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
            candidate: { select: { name: true, email: true } },
            job: { select: { id: true, title: true } },
        },
    });

    return (
        <div className="space-y-5">
            <div>
                <Link href="/recruiter/jobs" className="text-[14px] text-[#0260FF] hover:underline">
                    ← Back to my jobs
                </Link>
                <h2 className="mt-2 text-[22px] leading-[32px] font-medium text-[#252525]">{job.title}</h2>
                <p className="text-[15px] text-[#797484]">{applications.length} application(s)</p>
            </div>
            <RecruiterApplicationsTable applications={applications} showJob={false} />
        </div>
    );
}