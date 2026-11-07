import Link from "next/link";

export default function MyJobsPage() {
    return (
        <div className="rounded-xl border bg-white p-8 text-center">
            <p className="text-gray-600">Your posted jobs will be listed here.</p>
            <Link
                href="/recruiter/jobs/new"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
            >
                Post a job
            </Link>
        </div>
    );
}