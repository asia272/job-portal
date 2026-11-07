import { Suspense } from "react";
import Link from "next/link";
import VerifyForm from "./verify-form";

type SP = { token?: string | string[] };

export default function VerifyEmailPage({ searchParams }: { searchParams: Promise<SP> }) {
    return (
        <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
            <Link href="/" className="mb-8 text-center text-2xl font-bold">
                Insiderjobs
            </Link>

            <div className="rounded-xl border p-6 shadow-sm">
                <h1 className="text-xl font-semibold">Verify your email</h1>
                <Suspense fallback={<p className="mt-4 text-sm text-gray-500">Loading...</p>}>
                    <Content searchParams={searchParams} />
                </Suspense>
            </div>
        </main>
    );
}

async function Content({ searchParams }: { searchParams: Promise<SP> }) {
    const { token } = await searchParams;
    const value = Array.isArray(token) ? token[0] : token;

    if (!value) {
        return (
            <p className="mt-4 text-sm text-red-600">
                This verification link is invalid. Please use the link from your email.
            </p>
        );
    }

    return (
        <>
            <p className="mt-1 text-sm text-gray-500">
                Click the button below to confirm your email address and activate your account.
            </p>
            <VerifyForm token={value} />
        </>
    );
}