"use client";
import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/recruiter-auth";
import type { FormState } from "@/lib/form-state";
import PillInput from "@/components/pill-input";
import { ButtonSpinner } from "@/components/loader";

export default function ForgotForm() {
    const [state, action, pending] = useActionState<FormState, FormData>(requestPasswordReset, {});

    if (state.success) {
        return (
            <div className="mt-8">
                <p
                    role="status"
                    className="rounded-[8px] border border-green-200 bg-green-50 p-4 text-center text-[15px] leading-6 text-green-700"
                >
                    {state.success}
                </p>
                <p className="mt-6 text-center text-[16px] text-[#797484]">
                    <Link href="/recruiter/login" className="text-[#006CE2] underline">
                        Back to login
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <form action={action} className="mt-9">
            {state.error && (
                <p
                    role="alert"
                    className="mb-5 rounded-[8px] border border-red-200 bg-red-50 p-3 text-[14px] text-red-700"
                >
                    {state.error}
                </p>
            )}

            <PillInput
                icon="/assets/email_icon.svg"
                label="Email id"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.values?.email}
                error={state.fieldErrors?.email}
                required
            />

            <button
                type="submit"
                disabled={pending}
                className="mt-8 flex h-[53px] w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-[#007AFF] text-[18px] text-white transition-colors hover:bg-[#0068D9] disabled:cursor-not-allowed disabled:opacity-80"
            >
                {pending && <ButtonSpinner />}
                {pending ? "Sending..." : "Send reset link"}
            </button>

            <p className="mt-6 text-center text-[16px] text-[#797484]">
                Remember your password?{" "}
                <Link href="/recruiter/login" className="text-[#006CE2] underline">
                    Login
                </Link>
            </p>
        </form>
    );
}