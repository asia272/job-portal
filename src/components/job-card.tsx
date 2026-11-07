import Link from "next/link";
import { LEVEL_LABELS } from "@/lib/constants";

type JobCardProps = {
    job: {
        id: string;
        title: string;
        description: string;
        location: string;
        level: string;
        recruiter: { companyName: string; companyLogoUrl: string | null };
    };
};

export default function JobCard({ job }: JobCardProps) {
    const { recruiter } = job;
    return (
        <div className="flex flex-col rounded-lg border p-5 shadow-sm">
            {recruiter.companyLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={recruiter.companyLogoUrl} alt={recruiter.companyName} className="h-8 w-8 object-contain" />
            ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-sm font-semibold">
                    {recruiter.companyName[0]}
                </div>
            )}

            <h3 className="mt-3 font-medium">{job.title}</h3>

            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-600">{job.location}</span>
                <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-red-500">
                    {LEVEL_LABELS[job.level] ?? job.level}
                </span>
            </div>

            <p className="mt-3 line-clamp-3 flex-1 text-xs text-gray-500">{job.description}</p>

            <div className="mt-4 flex gap-2">
                <Link href={`/jobs/${job.id}`} className="rounded bg-blue-600 px-4 py-1.5 text-xs text-white">Apply now</Link>
                <Link href={`/jobs/${job.id}`} className="rounded border px-4 py-1.5 text-xs text-gray-600">Learn more</Link>
            </div>
        </div>
    );
}