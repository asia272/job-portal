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
    const href = `/jobs/${job.id}`;

    return (
        <article className="flex h-[290px] w-full flex-col rounded-[8px] border border-[#E1E1E1] bg-white p-5 shadow-[0px_4px_15px_0px_#0000000D]">
            {recruiter.companyLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={recruiter.companyLogoUrl}
                    alt={recruiter.companyName}
                    className="h-8 w-8 object-contain"
                />
            ) : (
                <div
                    aria-hidden
                    className="flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-[14px] font-medium text-[#424242]"
                >
                    {recruiter.companyName[0]}
                </div>
            )}

            <h3 className="mt-3 truncate text-[18px] leading-6 font-medium text-[#424242]">{job.title}</h3>

            <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
                <span className="max-w-full truncate rounded-[4px] border border-[#8BC3FF] bg-[#EFF5FF] px-3 py-1 text-[#3C7BD9]">
                    {job.location}
                </span>
                <span className="rounded-[4px] border border-[#FFBABA] bg-[#FFF5F3] px-3 py-1 text-[#E0574F]">
                    {LEVEL_LABELS[job.level] ?? job.level}
                </span>
            </div>

            <p className="mt-4 line-clamp-3 text-[15px] leading-[22px] text-[#686868]">{job.description}</p>

            <div className="mt-auto flex gap-3 pt-4">
                <Link
                    href={href}
                    className="inline-flex h-9 items-center rounded-[4px] bg-[#0260FF] px-5 text-[14px] text-white transition-colors hover:bg-[#0150D6]"
                >
                    Apply now
                </Link>
                <Link
                    href={href}
                    className="inline-flex h-9 items-center rounded-[4px] border border-[#CFCFCF] px-5 text-[14px] text-[#686868] transition-colors hover:bg-gray-50"
                >
                    Learn more
                </Link>
            </div>
        </article>
    );
}