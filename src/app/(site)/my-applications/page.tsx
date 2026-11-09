import { SectionLoader } from "@/components/loader";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCandidate } from "@/lib/candidate";
import ResumeUploader from "@/components/resume-uploader";
import ApplicationsTable from "@/components/applications-table";

export default function MyApplicationsPage() {
    return (
        <main className="w-full pt-8 pb-20">
            <div className="max-w-[940px]">
                <Suspense fallback={<SectionLoader />}>
                    <Content />
                </Suspense>
            </div>
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
            <h2 className="text-[20px] leading-[30px] font-medium text-[#252525]">Your Resume</h2>
            <div className="mt-4">
                <ResumeUploader resumeUrl={candidate.resumeUrl} fileName={candidate.resumeFileName} />
            </div>

            <h2 className="mt-12 text-[20px] leading-[30px] font-medium text-[#252525]">Jobs Applied</h2>
            <ApplicationsTable applications={applications} />
        </>
    );
}