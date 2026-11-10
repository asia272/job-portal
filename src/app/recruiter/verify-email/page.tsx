import { Suspense } from "react";
import AuthCard from "@/components/auth-card";
import { Spinner } from "@/components/loader";
import VerifyForm from "./verify-form";

type SP = { token?: string | string[] };

export default function VerifyEmailPage({ searchParams }: { searchParams: Promise<SP> }) {
    return (
        <AuthCard
            title="Verify Email"
            subtitle="Confirm your email address to activate your recruiter account"
        >
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

    if (!value) {
        return (
            <p className="mt-8 rounded-[8px] border border-red-200 bg-red-50 p-4 text-center text-[15px] text-red-700">
                This verification link is invalid. Please use the link from your email.
            </p>
        );
    }

    return <VerifyForm token={value} />;
}