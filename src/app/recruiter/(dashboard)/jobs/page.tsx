import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRecruiter } from "@/lib/recruiter";
import { CATEGORIES, LEVEL_LABELS } from "@/lib/constants";
import { formatDate, formatSalary } from "@/lib/format";
import RecruiterJobsTable from "@/components/recruiter-jobs-table";
import { SectionLoader } from "@/components/loader";

export default function MyJobsPage() {
    return (
        <Suspense fallback={<SectionLoader />}>
            <Content />
        </Suspense>
    );
}

async function Content() {
    const recruiter = await requireRecruiter();

    const jobs = await prisma.job.findMany({
        where: { recruiterId: recruiter.id },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { _count: { select: { applications: true } } },
    });

    const rows = jobs.map((j) => ({
        id: j.id,
        title: j.title,
        location: j.location,
        categoryLabel: CATEGORIES.find((c) => c.value === j.category)?.label ?? j.category,
        levelLabel: LEVEL_LABELS[j.level] ?? j.level,
        salary: formatSalary(j.salaryMin, j.salaryMax),
        status: j.status,
        createdAt: formatDate(j.createdAt),
        applicationCount: j._count.applications,
    }));

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
                <p className="text-[15px] text-[#797484]">{rows.length} job(s) posted</p>
                <Link
                    href="/recruiter/jobs/new"
                    className="inline-flex h-[44px] items-center rounded-[5px] bg-[#0260FF] px-6 text-[15px] text-white shadow-[0px_4px_15px_0px_#0000000D] transition-colors hover:bg-[#0150D6]"
                >
                    Post a job
                </Link>
            </div>

            {rows.length === 0 ? (
                <div className="rounded-[8px] border border-[#E1E1E1] bg-white p-10 text-center text-[15px] text-[#797484]">
                    You have not posted any jobs yet.
                </div>
            ) : (
                <RecruiterJobsTable jobs={rows} />
            )}
        </div>
    );
}