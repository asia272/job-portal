import { Suspense } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCandidate } from "@/lib/candidate";
import ResumeUploader from "@/components/resume-uploader";
import ApplicationsTable from "@/components/applications-table";

export default function MyApplicationsPage() {
    return (
        <main className="mx-auto max-w-4xl px-4 py-8">
            <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
                <Content />
            </Suspense>
        </main>
    );
}

async function Content() {
    const candidate = await getCurrentCandidate();
    if (!candidate) redirect("/sign-in");

    const applications = await prisma.application.findMany({
        where: { candidateId: candidate.id },
        orderBy: { createdAt: "desc" },
        include: {
            job: {
                select: {
                    id: true,
                    title: true,
                    location: true,
                    recruiter: { select: { companyName: true, companyLogoUrl: true } },
                },
            },
        },
    });

    return (
        <>
            <h2 className="font-semibold">Your Resume</h2>
            <div className="mt-3">
                <ResumeUploader resumeUrl={candidate.resumeUrl} fileName={candidate.resumeFileName} />
            </div>

            <h2 className="mt-10 font-semibold">Jobs Applied</h2>
            <ApplicationsTable applications={applications} />
        </>
    );
}