import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Briefcase, MapPin, User, Banknote } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentCandidate } from "@/lib/candidate";
import { LEVEL_LABELS } from "@/lib/constants";
import { formatSalary, timeAgo } from "@/lib/format";
import ApplyButton, { type ApplyState } from "@/components/apply-button";
import JobCard from "@/components/job-card";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <main className="mx-auto max-w-6xl px-4 py-8">
            <Suspense fallback={<p className="py-20 text-center text-sm text-gray-500">Loading job...</p>}>
                <Content params={params} />
            </Suspense>
        </main>
    );
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const job = await prisma.job.findUnique({
        where: { id },
        include: {
            recruiter: { select: { companyName: true, companyLogoUrl: true } },
        },
    });
    if (!job || job.status !== "ACTIVE") notFound();

    // Decide what the Apply button should do (UX only; the server action enforces the rules)
    const candidate = await getCurrentCandidate();
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
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { recruiter: { select: { companyName: true, companyLogoUrl: true } } },
    });

    const { recruiter } = job;

    return (
        <>
            {/* Header card */}
            <section className="flex flex-col gap-6 rounded-xl border border-blue-300 bg-blue-50/60 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div className="flex items-center gap-5">
                    {recruiter.companyLogoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={recruiter.companyLogoUrl}
                            alt={recruiter.companyName}
                            className="h-20 w-20 rounded-lg border bg-white object-contain p-3"
                        />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-white text-2xl font-semibold">
                            {recruiter.companyName[0]}
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-semibold">{job.title}</h1>
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-600">
                            <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" />{recruiter.companyName}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                            <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{LEVEL_LABELS[job.level] ?? job.level}</span>
                            <span className="flex items-center gap-1.5"><Banknote className="h-3.5 w-3.5" />CTC: {formatSalary(job.salaryMin, job.salaryMax)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                    <ApplyButton jobId={job.id} state={state} />
                    <p className="text-xs text-gray-500">Posted {timeAgo(job.createdAt)}</p>
                </div>
            </section>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
                {/* Left: details */}
                <div>
                    <h2 className="text-lg font-semibold">Job description</h2>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">{job.description}</p>

                    {job.responsibilities.length > 0 && (
                        <>
                            <h2 className="mt-8 text-lg font-semibold">Key responsibility</h2>
                            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-gray-600">
                                {job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                            </ol>
                        </>
                    )}

                    {job.skills.length > 0 && (
                        <>
                            <h2 className="mt-8 text-lg font-semibold">Skills required</h2>
                            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-gray-600">
                                {job.skills.map((s, i) => <li key={i}>{s}</li>)}
                            </ol>
                        </>
                    )}

                    <div className="mt-10">
                        <ApplyButton jobId={job.id} state={state} />
                    </div>
                </div>

                {/* Right: more jobs from the same company */}
                {moreJobs.length > 0 && (
                    <aside>
                        <h2 className="text-sm font-medium">More jobs from {recruiter.companyName}</h2>
                        <div className="mt-3 space-y-4">
                            {moreJobs.map((j) => <JobCard key={j.id} job={j} />)}
                        </div>
                    </aside>
                )}
            </div>
        </>
    );
}