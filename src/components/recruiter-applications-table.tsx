import Link from "next/link";
import { FileText } from "lucide-react";
import ApplicationActions from "@/components/application-actions";
import { formatDate } from "@/lib/format";

type Row = {
    id: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    createdAt: Date;
    resumeUrl: string;
    candidate: { name: string | null; email: string };
    job: { id: string; title: string };
};

const STATUS_STYLE: Record<Row["status"], string> = {
    PENDING: "bg-blue-50 text-blue-600",
    ACCEPTED: "bg-green-50 text-green-600",
    REJECTED: "bg-red-50 text-red-600",
};

const STATUS_LABEL: Record<Row["status"], string> = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
};

export default function RecruiterApplicationsTable({
    applications,
    showJob = true,
}: {
    applications: Row[];
    showJob?: boolean;
}) {
    if (applications.length === 0) {
        return (
            <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-500">
                No applications found.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b bg-gray-50">
                    <tr>
                        <th className="px-5 py-3 font-medium">Candidate</th>
                        {showJob && <th className="px-5 py-3 font-medium">Job</th>}
                        <th className="px-5 py-3 font-medium">Applied</th>
                        <th className="px-5 py-3 font-medium">Resume</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 font-medium">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {applications.map((a) => (
                        <tr key={a.id} className="border-b last:border-0">
                            <td className="px-5 py-3">
                                <p className="font-medium">{a.candidate.name ?? "Unnamed candidate"}</p>
                                <a href={`mailto:${a.candidate.email}`} className="text-xs text-gray-500 hover:underline">
                                    {a.candidate.email}
                                </a>
                            </td>
                            {showJob && (
                                <td className="px-5 py-3">
                                    <Link href={`/recruiter/jobs/${a.job.id}/applications`} className="text-gray-700 hover:underline">
                                        {a.job.title}
                                    </Link>
                                </td>
                            )}
                            <td className="px-5 py-3 text-gray-600">{formatDate(a.createdAt)}</td>
                            <td className="px-5 py-3">
                                <a
                                    href={a.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
                                >
                                    <FileText className="h-4 w-4" />
                                    View
                                </a>
                            </td>
                            <td className="px-5 py-3">
                                <span className={`rounded px-3 py-1 text-xs ${STATUS_STYLE[a.status]}`}>
                                    {STATUS_LABEL[a.status]}
                                </span>
                            </td>
                            <td className="px-5 py-3">
                                <ApplicationActions applicationId={a.id} status={a.status} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}