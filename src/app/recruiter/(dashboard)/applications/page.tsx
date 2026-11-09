import { SectionLoader } from "@/components/loader";
import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRecruiter } from "@/lib/recruiter";
import RecruiterApplicationsTable from "@/components/recruiter-applications-table";

type SP = { status?: string };
type Status = "PENDING" | "ACCEPTED" | "REJECTED";

const TABS: { label: string; value?: Status }[] = [
    { label: "All" },
    { label: "Pending", value: "PENDING" },
    { label: "Accepted", value: "ACCEPTED" },
    { label: "Rejected", value: "REJECTED" },
];

export default function ApplicationsPage({ searchParams }: { searchParams: Promise<SP> }) {
    return (
        <Suspense fallback={<SectionLoader />}>
            <Content searchParams={searchParams} />
        </Suspense>
    );
}

async function Content({ searchParams }: { searchParams: Promise<SP> }) {
    const recruiter = await requireRecruiter();
    const { status } = await searchParams;

    const filter = TABS.find((t) => t.value && t.value === status)?.value;


    //Get all applications for the recruiter
    const applications = await prisma.application.findMany({
        where: {
            job: { recruiterId: recruiter.id },
            ...(filter && { status: filter }),
        },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
            candidate: { select: { name: true, email: true } },
            job: { select: { id: true, title: true } },
        },
    });

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
                {TABS.map((t) => {
                    const active = t.value === filter;
                    return (
                        <Link
                            key={t.label}
                            href={t.value ? `/recruiter/applications?status=${t.value}` : "/recruiter/applications"}
                            className={`rounded-full border px-4 py-1.5 text-sm ${active ? "border-blue-600 bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {t.label}
                        </Link>
                    );
                })}
            </div>
            <RecruiterApplicationsTable applications={applications} />
        </div>
    );
}