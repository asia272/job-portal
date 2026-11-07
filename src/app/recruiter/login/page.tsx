import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentRecruiter } from "@/lib/recruiter";
import LoginForm from "./login-form";

export default function RecruiterLoginPage({
    searchParams,
}: {
    searchParams: Promise<{ verified?: string }>;
}) {
    return (
        <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
            <Link href="/" className="mb-8 text-center text-2xl font-bold">
                Insiderjobs
            </Link>

            <div className="rounded-xl border p-6 shadow-sm">
                <h1 className="text-xl font-semibold">Recruiter login</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Sign in to manage your jobs and applications.
                </p>

                <Suspense fallback={null}>
                    <AlreadyLoggedIn />
                    <VerifiedNotice searchParams={searchParams} />
                </Suspense>

                <LoginForm />

                <p className="mt-6 text-center text-sm text-gray-600">
                    New recruiter?{" "}
                    <Link href="/recruiter/register" className="text-blue-600 hover:underline">
                        Create an account
                    </Link>
                </p>
            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
                Looking for a job?{" "}
                <Link href="/" className="underline">
                    Go to job seeker side
                </Link>
            </p>
        </main>
    );
}

// If a verified recruiter is already logged in, skip the login page
async function AlreadyLoggedIn() {
    const recruiter = await getCurrentRecruiter();
    if (recruiter) redirect("/recruiter/jobs");
    return null;
}

async function VerifiedNotice({ searchParams }: { searchParams: Promise<{ verified?: string }> }) {
    const { verified } = await searchParams;
    if (verified !== "1") return null;
    return (
        <p className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Email verified successfully. You can log in now.
        </p>
    );
}