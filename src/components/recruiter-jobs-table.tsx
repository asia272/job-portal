"use client";
import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2, Users } from "lucide-react";
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
        <tr className={`border-b last:border-0 ${pending ? "opacity-60" : ""}`}>
            <td className="px-5 py-3">
                <p className="font-medium">{job.title}</p>
                <p className="text-xs text-gray-500">
                    {job.categoryLabel} · {job.levelLabel}
                </p>
            </td>
            <td className="px-5 py-3 text-gray-600">{job.location}</td>
            <td className="px-5 py-3 text-gray-600">{job.salary}</td>
            <td className="px-5 py-3 text-gray-600">{job.createdAt}</td>
            <td className="px-5 py-3">
                <Link
                    href={`/recruiter/jobs/${job.id}/applications`}
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
                >
                    <Users className="h-4 w-4" />
                    {job.applicationCount}
                </Link>
            </td>
            <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={active}
                        aria-label={active ? "Set inactive" : "Set active"}
                        disabled={pending}
                        onClick={toggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:cursor-not-allowed ${active ? "bg-green-500" : "bg-gray-300"
                            }`}
                    >
                        <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${active ? "translate-x-5" : "translate-x-0.5"
                                }`}
                        />
                    </button>
                    <span className={`text-xs ${active ? "text-green-600" : "text-gray-500"}`}>
                        {active ? "Active" : "Inactive"}
                    </span>
                </div>
            </td>
            <td className="px-5 py-3">
                <div className="flex items-center gap-1">
                    <Link
                        href={`/recruiter/jobs/${job.id}/edit`}
                        className="rounded p-2 text-gray-600 hover:bg-gray-100"
                        aria-label="Edit job"
                    >
                        <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                        type="button"
                        onClick={remove}
                        disabled={pending}
                        className="rounded p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        aria-label="Delete job"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

export default function RecruiterJobsTable({ jobs }: { jobs: JobRowData[] }) {
    return (
        <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-b bg-gray-50">
                    <tr>
                        <th className="px-5 py-3 font-medium">Job</th>
                        <th className="px-5 py-3 font-medium">Location</th>
                        <th className="px-5 py-3 font-medium">Salary</th>
                        <th className="px-5 py-3 font-medium">Posted</th>
                        <th className="px-5 py-3 font-medium">Applicants</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 font-medium">Actions</th>
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