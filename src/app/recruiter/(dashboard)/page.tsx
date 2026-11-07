import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRecruiter } from "@/lib/recruiter";

export default function DashboardPage() {
    return (
        <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
            <Content />
        </Suspense>
    );
}

const STATUS_STYLE = {
    PENDING: "bg-blue-50 text-blue-600",
    ACCEPTED: "bg-green-50 text-green-600",
    REJECTED: "bg-red-50 text-red-600",
} as const;

async function Content() {
    // Layouts don't protect pages, so every page checks again
    const recruiter = await requireRecruiter();
    const mine = { job: { recruiterId: recruiter.id } };

    const [totalJobs, activeJobs, totalApplications, pending, recent] = await Promise.all([
        prisma.job.count({ where: { recruiterId: recruiter.id } }),
        prisma.job.count({ where: { recruiterId: recruiter.id, status: "ACTIVE" } }),
        prisma.application.count({ where: mine }),
        prisma.application.count({ where: { ...mine, status: "PENDING" } }),
        prisma.application.findMany({
            where: mine,
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                candidate: { select: { name: true, email: true } },
                job: { select: { title: true } },
            },
        }),
    ]);

    const stats = [
        { label: "Total jobs", value: totalJobs },
        { label: "Active jobs", value: activeJobs },
        { label: "Applications", value: totalApplications },
        { label: "Pending review", value: pending },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold">Welcome back, {recruiter.name}</h2>
                <p className="text-sm text-gray-500">{recruiter.companyName}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((s) => (
                    <div key={s.label} className="rounded-xl border bg-white p-5">
                        <p className="text-sm text-gray-500">{s.label}</p>
                        <p className="mt-1 text-3xl font-semibold">{s.value}</p>
                    </div>
                ))}
            </div>

            <section className="rounded-xl border bg-white">
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <h3 className="font-medium">Recent applications</h3>
                    <Link href="/recruiter/applications" className="text-sm text-blue-600 hover:underline">
                        View all
                    </Link>
                </div>

                {recent.length === 0 ? (
                    <p className="p-5 text-sm text-gray-500">
                        No applications yet. They will appear here once candidates apply to your jobs.
                    </p>
                ) : (
                    <ul className="divide-y">
                        {recent.map((a) => (
                            <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                                <div className="min-w-0">
                                    <p className="truncate font-medium">{a.candidate.name ?? a.candidate.email}</p>
                                    <p className="truncate text-gray-500">{a.job.title}</p>
                                </div>
                                <span className={`shrink-0 rounded px-3 py-1 text-xs ${STATUS_STYLE[a.status]}`}>
                                    {a.status.charAt(0) + a.status.slice(1).toLowerCase()}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}