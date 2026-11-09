import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRecruiter } from "@/lib/recruiter";
import { SectionLoader } from "@/components/loader";

export default function DashboardPage() {
    return (
        <Suspense fallback={<SectionLoader />}>
            <Content />
        </Suspense>
    );
}

const STATUS_STYLE = {
    PENDING: "bg-[#E5F0FF] text-[#007AFF]",
    ACCEPTED: "bg-[#E6F8E8] text-[#1A9B2E]",
    REJECTED: "bg-[#FFE8E8] text-[#D92D2D]",
} as const;

const STATUS_LABEL = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
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
            <p className="-mt-3 text-[16px] text-[#797484]">
                Welcome back, {recruiter.name} · {recruiter.companyName}
            </p>

            <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((s) => (
                    <div
                        key={s.label}
                        className="rounded-[8px] border border-[#E1E1E1] bg-white p-5 shadow-[0px_4px_15px_0px_#0000000D]"
                    >
                        <p className="text-[15px] text-[#797484]">{s.label}</p>
                        <p className="mt-2 text-[34px] leading-none font-medium text-[#252525]">{s.value}</p>
                    </div>
                ))}
            </div>

            <section className="rounded-[8px] border border-[#E1E1E1] bg-white shadow-[0px_4px_15px_0px_#0000000D]">
                <div className="flex items-center justify-between border-b border-[#E1E1E1] px-5 py-4">
                    <h2 className="text-[18px] font-medium text-[#252525]">Recent applications</h2>
                    <Link href="/recruiter/applications" className="text-[14px] text-[#0260FF] hover:underline">
                        View all
                    </Link>
                </div>

                {recent.length === 0 ? (
                    <p className="p-5 text-[15px] text-[#797484]">
                        No applications yet. They will appear here once candidates apply to your jobs.
                    </p>
                ) : (
                    <ul className="divide-y divide-[#E1E1E1]">
                        {recent.map((a) => (
                            <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-4">
                                <div className="min-w-0">
                                    <p className="truncate text-[15px] font-medium text-[#252525]">
                                        {a.candidate.name ?? a.candidate.email}
                                    </p>
                                    <p className="truncate text-[14px] text-[#797484]">{a.job.title}</p>
                                </div>
                                <span
                                    className={`inline-flex h-8 w-[84px] shrink-0 items-center justify-center rounded-[4px] text-[14px] ${STATUS_STYLE[a.status]}`}
                                >
                                    {STATUS_LABEL[a.status]}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}