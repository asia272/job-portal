import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRecruiter } from "@/lib/recruiter";
import { CATEGORIES, LEVEL_LABELS } from "@/lib/constants";
import { formatDate, formatSalary } from "@/lib/format";
import RecruiterJobsTable from "@/components/recruiter-jobs-table";

export default function MyJobsPage() {
    return (
        <Suspense fallback={<p className="text-sm text-gray-500">Loading jobs...</p>}>
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
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{rows.length} job(s) posted</p>
                <Link
                    href="/recruiter/jobs/new"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                    Post a job
                </Link>
            </div>

            {rows.length === 0 ? (
                <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500">
                    You have not posted any jobs yet.
                </div>
            ) : (
                <RecruiterJobsTable jobs={rows} />
            )}
        </div>
    );
}