import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRecruiter } from "@/lib/recruiter";
import { updateJob } from "@/actions/recruiter-jobs";
import JobForm from "@/components/job-form";

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
            <Content params={params} />
        </Suspense>
    );
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
    const recruiter = await requireRecruiter();
    const { id } = await params;

    // findFirst with recruiterId: another recruiter's job returns 404
    const job = await prisma.job.findFirst({
        where: { id, recruiterId: recruiter.id },
    });
    if (!job) notFound();

    return (
        <div className="mx-auto max-w-3xl space-y-4">
            <h2 className="text-2xl font-semibold">Edit job</h2>
            <JobForm
                action={updateJob.bind(null, job.id)}
                submitLabel="Save changes"
                initial={{
                    title: job.title,
                    description: job.description,
                    category: job.category,
                    level: job.level,
                    location: job.location,
                    salaryMin: job.salaryMin?.toString() ?? "",
                    salaryMax: job.salaryMax?.toString() ?? "",
                    responsibilities: job.responsibilities.join("\n"),
                    skills: job.skills.join("\n"),
                }}
            />
        </div>
    );
}