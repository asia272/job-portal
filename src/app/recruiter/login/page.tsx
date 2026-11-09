import { Suspense } from "react";
import Image from "next/image";
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
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#F4F5F7] px-4 py-10">
            <Link href="/" aria-label="Insiderjobs home" className="mb-8">
                <Image src="/assets/logo.svg" alt="Insiderjobs" width={180} height={38} priority />
            </Link>

            <div className="w-full max-w-[463px] rounded-[16px] bg-white px-6 pt-[52px] pb-[60px] shadow-[0px_4px_15px_0px_#0000000D] sm:px-[54px]">
                <h1 className="text-center text-[32px] leading-[40px] font-medium text-[#222222]">
                    Recruiter Login
                </h1>
                <p className="mt-3 text-center text-[15px] text-[#3F3A7A]">
                    Welcome back! Please sign in to continue
                </p>

                <Suspense fallback={null}>
                    <AlreadyLoggedIn />
                    <VerifiedNotice searchParams={searchParams} />
                </Suspense>

                <LoginForm />
            </div>

            <p className="mt-6 text-center text-[14px] text-[#797484]">
                Looking for a job?{" "}
                <Link href="/" className="text-[#006CE2] underline">
                    Go to job seeker side
                </Link>
            </p>
        </main>
    );
}

// If a verified recruiter is already logged in, skip the login page
async function AlreadyLoggedIn() {
    const recruiter = await getCurrentRecruiter();
    if (recruiter) redirect("/recruiter/dashboard");
    return null;
}

async function VerifiedNotice({ searchParams }: { searchParams: Promise<{ verified?: string }> }) {
    const { verified } = await searchParams;
    if (verified !== "1") return null;
    return (
        <p className="mt-5 rounded-[8px] border border-green-200 bg-green-50 p-3 text-center text-[14px] text-green-700">
            Email verified successfully. You can log in now.
        </p>
    );
}