import JobForm from "@/components/job-form";
import { createJob } from "@/actions/recruiter-jobs";

export default function NewJobPage() {
    // The real protection is requireRecruiter() inside createJob, plus the layout and proxy.
    return (
        <div className="max-w-[800px] space-y-5">
            <p className="text-[15px] text-[#797484]">
                The job goes live on the job board immediately.
            </p>
            <JobForm action={createJob} submitLabel="Post job" />
        </div>
    );
}