import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCandidate } from "@/lib/candidate";
import { LEVEL_LABELS } from "@/lib/constants";
import { formatSalary, timeAgo } from "@/lib/format";
import ApplyButton, { type ApplyState } from "@/components/apply-button";
import JobCard from "@/components/job-card";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <main className="mx-auto w-full max-w-[1231px] px-4 pb-20">
            <Suspense
                fallback={
                    <div className="mt-6 h-[232px] rounded-[10px] border border-[#0260FF] bg-[#F2F7FF]" />
                }
            >
                <Content params={params} />
            </Suspense>
        </main>
    );
}

function Meta({ icon, children }: { icon: string; children: React.ReactNode }) {
    return (
        <span className="flex items-center gap-[7px] text-[15px] text-[#5E5E5E]">
            <Image src={icon} alt="" width={18} height={18} className="shrink-0" />
            {children}
        </span>
    );
}

function NumberedList({ title, items }: { title: string; items: string[] }) {
    if (items.length === 0) return null;
    return (
        <section className="mt-9">
            <h2 className="text-[22px] leading-[32px] font-medium text-[#252525]">{title}</h2>
            <ol className="mt-3 list-decimal space-y-[2px] pl-6 text-[15px] leading-[25px] text-[#7A7B7D]">
                {items.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ol>
        </section>
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

    // Decides what the Apply button does (UX only; the server action enforces the rules)
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
            <section className="mt-6 flex flex-col gap-6 rounded-[10px] border border-[#0260FF] bg-[#F2F7FF] p-6 sm:flex-row sm:items-center sm:justify-between lg:h-[232px] lg:px-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-[34px]">
                    <div className="flex size-[120px] shrink-0 items-center justify-center rounded-[8px] border border-[#E1E1E1] bg-white">
                        {recruiter.companyLogoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={recruiter.companyLogoUrl}
                                alt={recruiter.companyName}
                                className="size-[64px] object-contain"
                            />
                        ) : (
                            <span className="text-[36px] font-medium text-[#3B3B3B]">
                                {recruiter.companyName[0]}
                            </span>
                        )}
                    </div>

                    <div>
                        <h1 className="text-[28px] leading-[42px] font-medium text-[#3B3B3B] sm:text-[32px]">
                            {job.title}
                        </h1>
                        <div className="mt-4 flex flex-wrap gap-x-[26px] gap-y-2">
                            <Meta icon="/assets/suitcase_icon.svg">{recruiter.companyName}</Meta>
                            <Meta icon="/assets/location_icon.svg">{job.location}</Meta>
                            <Meta icon="/assets/person_icon.svg">{LEVEL_LABELS[job.level] ?? job.level}</Meta>
                            <Meta icon="/assets/money_icon.svg">
                                CTC: {formatSalary(job.salaryMin, job.salaryMax)}
                            </Meta>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-start gap-3 sm:items-end">
                    <ApplyButton jobId={job.id} state={state} />
                    <p className="text-[15px] text-[#5E5E5E]">Posted {timeAgo(job.createdAt)}</p>
                </div>
            </section>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_338px] lg:gap-x-[60px]">
                {/* Left: details */}
                <div>
                    <section>
                        <h2 className="text-[22px] leading-[32px] font-medium text-[#252525]">
                            Job description
                        </h2>
                        <p className="mt-3 whitespace-pre-line text-[15px] leading-[25px] text-[#7A7B7D]">
                            {job.description}
                        </p>
                    </section>

                    <NumberedList title="Key responsibility" items={job.responsibilities} />
                    <NumberedList title="Skills required" items={job.skills} />

                    <div className="mt-10">
                        <ApplyButton jobId={job.id} state={state} />
                    </div>
                </div>

                {/* Right: more jobs from the same company */}
                {moreJobs.length > 0 && (
                    <aside aria-label={`More jobs from ${recruiter.companyName}`}>
                        <h2 className="text-[16px] leading-[24px] font-medium text-[#252525]">
                            More jobs from {recruiter.companyName}
                        </h2>
                        <div className="mt-4 space-y-[18px]">
                            {moreJobs.map((j) => (
                                <JobCard key={j.id} job={j} />
                            ))}
                        </div>
                    </aside>
                )}
            </div>
        </>
    );
}