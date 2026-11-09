import { SectionLoader } from "@/components/loader";
import { Suspense } from "react";
import Link from "next/link";
import ResetForm from "./reset-form";

type SP = { token?: string | string[] };

export default function ResetPasswordPage({ searchParams }: { searchParams: Promise<SP> }) {
    return (
        <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
            <Link href="/" className="mb-8 text-center text-2xl font-bold">
                Insiderjobs
            </Link>

            <div className="rounded-xl border p-6 shadow-sm">
                <h1 className="text-xl font-semibold">Choose a new password</h1>
                <Suspense fallback={<SectionLoader />}>
                    <Content searchParams={searchParams} />
                </Suspense>
            </div>
        </main>
    );
}

async function Content({ searchParams }: { searchParams: Promise<SP> }) {
    const { token } = await searchParams;
    const value = Array.isArray(token) ? token[0] : token;

    if (!value || !/^[a-f0-9]{64}$/.test(value)) {
        return (
            <p className="mt-4 text-sm text-red-600">
                This reset link is invalid.{" "}
                <Link href="/recruiter/forgot-password" className="underline">
                    Request a new one
                </Link>
                .
            </p>
        );
    }

    return (
        <>
            <p className="mt-1 text-sm text-gray-500">
                Enter your new password below. You will be logged in right after.
            </p>
            <ResetForm token={value} />
        </>
    );
}