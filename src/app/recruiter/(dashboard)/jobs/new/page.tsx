import JobForm from "@/components/job-form";
import { createJob } from "@/actions/recruiter-jobs";

export default function NewJobPage() {
    // This page renders only an empty form. The real protection is
    // requireRecruiter() inside createJob, and the layout + proxy.
    return (
        <div className="mx-auto max-w-3xl space-y-4">
            <div>
                <h2 className="text-2xl font-semibold">Post a new job</h2>
                <p className="text-sm text-gray-500">The job goes live on the job board immediately.</p>
            </div>
            <JobForm action={createJob} submitLabel="Post job" />
        </div>
    );
}