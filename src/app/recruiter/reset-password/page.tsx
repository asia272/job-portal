import { Suspense } from "react";
import Link from "next/link";
import AuthCard from "@/components/auth-card";
import { Spinner } from "@/components/loader";
import ResetForm from "./reset-form";

type SP = { token?: string | string[] };

export default function ResetPasswordPage({ searchParams }: { searchParams: Promise<SP> }) {
    return (
        <AuthCard title="New Password" subtitle="Choose a new password. You will be logged in right after.">
            <Suspense
                fallback={
                    <div className="mt-8 flex justify-center">
                        <Spinner size={40} />
                    </div>
                }
            >
                <Content searchParams={searchParams} />
            </Suspense>
        </AuthCard>
    );
}

async function Content({ searchParams }: { searchParams: Promise<SP> }) {
    const { token } = await searchParams;
    const value = Array.isArray(token) ? token[0] : token;

    if (!value || !/^[a-f0-9]{64}$/.test(value)) {
        return (
            <p className="mt-8 rounded-[8px] border border-red-200 bg-red-50 p-4 text-center text-[15px] text-red-700">
                This reset link is invalid.{" "}
                <Link href="/recruiter/forgot-password" className="underline">
                    Request a new one
                </Link>
                .
            </p>
        );
    }

    return <ResetForm token={value} />;
}