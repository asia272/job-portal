import { Suspense } from "react";
import { requireRecruiter } from "@/lib/recruiter";
import RecruiterShell from "@/components/recruiter-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
            <ShellLoader>{children}</ShellLoader>
        </Suspense>
    );
}

async function ShellLoader({ children }: { children: React.ReactNode }) {
    const recruiter = await requireRecruiter();

    return (
        <RecruiterShell
            recruiter={{
                name: recruiter.name,
                email: recruiter.email,
                companyName: recruiter.companyName,
            }}
        >
            {children}
        </RecruiterShell>
    );
}