"use client";
import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { setJobStatus, deleteJob } from "@/actions/recruiter-jobs";

export type JobRowData = {
    id: string;
    title: string;
    location: string;
    categoryLabel: string;
    levelLabel: string;
    salary: string;
    status: "ACTIVE" | "INACTIVE";
    createdAt: string; // formatted on the server, avoids hydration mismatch
    applicationCount: number;
};

const TH = "px-5 py-[22px] text-[14px] leading-none font-semibold text-[#252525]";
const TD = "px-5 py-4 text-[15px] text-[#5E5E5E]";

function JobRow({ job }: { job: JobRowData }) {
    const [pending, start] = useTransition();
    const active = job.status === "ACTIVE";

    function toggle() {
        start(async () => {
            const res = await setJobStatus(job.id, active ? "INACTIVE" : "ACTIVE");
            if (res.error) toast.error(res.error);
            else toast.success(active ? "Job is now inactive" : "Job is now active");
        });
    }

    function remove() {
        const ok = window.confirm(
            `Delete "${job.title}"?\n\nAll ${job.applicationCount} application(s) for it will be deleted too. This cannot be undone.\n\nTip: set it to inactive instead if you only want to hide it.`
        );
        if (!ok) return;
        start(async () => {
            const res = await deleteJob(job.id);
            if (res.error) toast.error(res.error);
            else toast.success("Job deleted");
        });
    }

    return (
        <tr className={`border-b border-[#25252533] last:border-0 ${pending ? "opacity-60" : ""}`}>
            <td className={TD}>
                <p className="text-[15px] font-medium text-[#252525]">{job.title}</p>
                <p className="mt-0.5 text-[13px] text-[#797484]">
                    {job.categoryLabel} · {job.levelLabel}
                </p>
            </td>
            <td className={TD}>{job.location}</td>
            <td className={TD}>{job.salary}</td>
            <td className={TD}>{job.createdAt}</td>
            <td className={TD}>
                <Link
                    href={`/recruiter/jobs/${job.id}/applications`}
                    className="inline-flex items-center gap-1.5 text-[#0260FF] hover:underline"
                >
                    <Users className="size-4" aria-hidden />
                    {job.applicationCount}
                </Link>
            </td>
            <td className={TD}>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={active}
                        aria-label={active ? "Set inactive" : "Set active"}
                        disabled={pending}
                        onClick={toggle}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed ${active ? "bg-[#0260FF]" : "bg-[#D1D5DB]"
                            }`}
                    >
                        <span
                            className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${active ? "translate-x-[22px]" : "translate-x-0.5"
                                }`}
                        />
                    </button>
                    <span className={`text-[13px] ${active ? "text-[#0260FF]" : "text-[#797484]"}`}>
                        {active ? "Active" : "Inactive"}
                    </span>
                </div>
            </td>
            <td className={TD}>
                <div className="flex items-center gap-1">
                    <Link
                        href={`/recruiter/jobs/${job.id}/edit`}
                        aria-label="Edit job"
                        className="flex size-9 items-center justify-center rounded-[6px] transition-colors hover:bg-[#EFF5FF]"
                    >
                        <Image src="/assets/edit_icon.svg" alt="" width={18} height={18} className="size-[18px]" />
                    </Link>
                    <button
                        type="button"
                        onClick={remove}
                        disabled={pending}
                        aria-label="Delete job"
                        className="flex size-9 cursor-pointer items-center justify-center rounded-[6px] transition-colors hover:bg-[#FFF5F3] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Image src="/assets/delete_icon.svg" alt="" width={18} height={18} className="size-[18px]" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

export default function RecruiterJobsTable({ jobs }: { jobs: JobRowData[] }) {
    return (
        <div className="overflow-x-auto rounded-[6px] border border-[#25252533] bg-white">
            <table className="w-full min-w-[860px] text-left">
                <thead>
                    <tr className="border-b border-[#25252533]">
                        <th className={TH}>Job</th>
                        <th className={TH}>Location</th>
                        <th className={TH}>Salary</th>
                        <th className={TH}>Posted</th>
                        <th className={TH}>Applicants</th>
                        <th className={TH}>Status</th>
                        <th className={TH}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job) => (
                        <JobRow key={job.id} job={job} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}