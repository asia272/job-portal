import Link from "next/link";
import { FileText } from "lucide-react";
import ApplicationActions from "@/components/application-actions";
import { formatDate } from "@/lib/format";

type Status = "PENDING" | "ACCEPTED" | "REJECTED";

type Row = {
    id: string;
    status: Status;
    createdAt: Date;
    resumeUrl: string;
    candidate: { name: string | null; email: string };
    job: { id: string; title: string };
};

const STATUS_STYLE: Record<Status, string> = {
    PENDING: "bg-[#E5F0FF] text-[#007AFF]",
    ACCEPTED: "bg-[#E6F8E8] text-[#1A9B2E]",
    REJECTED: "bg-[#FFE8E8] text-[#D92D2D]",
};

const STATUS_LABEL: Record<Status, string> = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
};

const TH = "px-5 py-[22px] text-[14px] leading-none font-semibold text-[#252525]";
const TD = "px-5 py-4 text-[15px] text-[#5E5E5E]";

export default function RecruiterApplicationsTable({
    applications,
    showJob = true,
}: {
    applications: Row[];
    showJob?: boolean;
}) {
    if (applications.length === 0) {
        return (
            <div className="rounded-[8px] border border-[#E1E1E1] bg-white p-10 text-center text-[15px] text-[#797484]">
                No applications found.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-[6px] border border-[#25252533] bg-white">
            <table className="w-full min-w-[800px] text-left">
                <thead>
                    <tr className="border-b border-[#25252533]">
                        <th className={TH}>Candidate</th>
                        {showJob && <th className={TH}>Job</th>}
                        <th className={TH}>Applied</th>
                        <th className={TH}>Resume</th>
                        <th className={TH}>Status</th>
                        <th className={TH}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {applications.map((a) => (
                        <tr key={a.id} className="border-b border-[#25252533] last:border-0">
                            <td className={TD}>
                                <p className="font-medium text-[#252525]">{a.candidate.name ?? "Unnamed candidate"}</p>
                                <a
                                    href={`mailto:${a.candidate.email}`}
                                    className="text-[13px] text-[#797484] hover:underline"
                                >
                                    {a.candidate.email}
                                </a>
                            </td>
                            {showJob && (
                                <td className={TD}>
                                    <Link
                                        href={`/recruiter/jobs/${a.job.id}/applications`}
                                        className="text-[#252525] hover:text-[#0260FF] hover:underline"
                                    >
                                        {a.job.title}
                                    </Link>
                                </td>
                            )}
                            <td className={TD}>{formatDate(a.createdAt)}</td>
                            <td className={TD}>
                                <a
                                    href={a.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[#0260FF] hover:underline"
                                >
                                    <FileText className="size-4" aria-hidden />
                                    View
                                </a>
                            </td>
                            <td className={TD}>
                                <span
                                    className={`inline-flex h-8 w-[84px] items-center justify-center rounded-[4px] text-[14px] ${STATUS_STYLE[a.status]}`}
                                >
                                    {STATUS_LABEL[a.status]}
                                </span>
                            </td>
                            <td className={TD}>
                                <ApplicationActions applicationId={a.id} status={a.status} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}