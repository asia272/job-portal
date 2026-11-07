import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCandidate } from "@/lib/candidate";
import ResumeUploader from "@/components/resume-uploader";
import ApplicationsTable from "@/components/applications-table";

export default async function MyApplications() {
    const candidate = await getCurrentCandidate();
    if (!candidate) redirect("/sign-in");

    const applications = await prisma.application.findMany({
        where: { candidateId: candidate.id },
        orderBy: { createdAt: "desc" },
        include: {
            job: {
                select: {
                    id: true, title: true, location: true,
                    recruiter: { select: { companyName: true, companyLogoUrl: true } },
                },
            },
        },
    });

    return (
        <main className="mx-auto max-w-4xl px-4 py-8">
            <h2 className="font-semibold">Your Resume</h2>
            <ResumeUploader resumeUrl={candidate.resumeUrl} fileName={candidate.resumeFileName} />

            <h2 className="mt-8 font-semibold">Jobs Applied</h2>
            <ApplicationsTable applications={applications} />
        </main>
    );
}