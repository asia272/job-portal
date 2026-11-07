type Row = {
    id: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    createdAt: Date;
    job: {
        id: string;
        title: string;
        location: string;
        recruiter: { companyName: string; companyLogoUrl: string | null };
    };
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

export default function ApplicationsTable({ applications }: { applications: Row[] }) {
    if (applications.length === 0) {
        return <p className="mt-3 text-sm text-gray-500">You haven&apos;t applied to any jobs yet.</p>;
    }

    return (
        <div className="mt-3 overflow-hidden rounded-lg border">
            <table className="w-full text-left text-sm">
                <thead className="border-b">
                    <tr>
                        <th className="px-5 py-3 font-medium">Company</th>
                        <th className="px-5 py-3 font-medium">Job Title</th>
                        <th className="px-5 py-3 font-medium">Location</th>
                        <th className="px-5 py-3 font-medium">Date</th>
                        <th className="px-5 py-3 font-medium">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {applications.map((a) => (
                        <tr key={a.id} className="border-b last:border-0">
                            <td className="px-5 py-3">{a.job.recruiter.companyName}</td>
                            <td className="px-5 py-3 text-gray-600">{a.job.title}</td>
                            <td className="px-5 py-3 text-gray-600">{a.job.location}</td>
                            <td className="px-5 py-3 text-gray-600">
                                {a.createdAt.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-5 py-3">
                                <span className={`rounded px-3 py-1 text-xs ${STATUS_STYLE[a.status]}`}>{STATUS_LABEL[a.status]}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}