"use client";
import { useActionState } from "react";
import Link from "next/link";
import { registerRecruiter } from "@/actions/recruiter-auth";
import type { FormState } from "@/lib/form-state";
import PillInput from "@/components/pill-input";
import { ButtonSpinner } from "@/components/loader";

export default function RegisterForm() {
    const [state, action, pending] = useActionState<FormState, FormData>(registerRecruiter, {});
    const errors = state.fieldErrors ?? {};

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
        <form action={action} className="mt-9 space-y-5">
            {state.error && (
                <p
                    role="alert"
                    className="rounded-[8px] border border-red-200 bg-red-50 p-3 text-[14px] text-red-700"
                >
                    {state.error}
                </p>
            )}

            <PillInput
                icon="/assets/person_icon.svg"
                label="Your name"
                name="name"
                autoComplete="name"
                defaultValue={state.values?.name}
                error={errors.name}
                required
            />
            <PillInput
                icon="/assets/company_icon.svg"
                label="Company name"
                name="companyName"
                autoComplete="organization"
                defaultValue={state.values?.companyName}
                error={errors.companyName}
                required
            />
            <PillInput
                icon="/assets/email_icon.svg"
                label="Work email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.values?.email}
                error={errors.email}
                required
            />
            <div>
                <PillInput
                    icon="/assets/lock_icon.svg"
                    label="Password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    error={errors.password}
                    required
                />
                {!errors.password && (
                    <p className="mt-1.5 px-5 text-[13px] text-[#797484]">
                        At least 8 characters, with a letter and a number.
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={pending}
                className="flex h-[53px] w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-[#007AFF] text-[18px] text-white transition-colors hover:bg-[#0068D9] disabled:cursor-not-allowed disabled:opacity-80"
            >
                {pending && <ButtonSpinner />}
                {pending ? "Creating account..." : "Create account"}
            </button>

            <p className="pt-1 text-center text-[16px] text-[#797484]">
                Already have an account?{" "}
                <Link href="/recruiter/login" className="text-[#006CE2] underline">
                    Login
                </Link>
            </p>
        </form>
    );
}