"use client";
import { useActionState } from "react";
import { resetRecruiterPassword } from "@/actions/recruiter-auth";
import type { FormState } from "@/lib/form-state";
import PillInput from "@/components/pill-input";
import { ButtonSpinner } from "@/components/loader";

export default function ResetForm({ token }: { token: string }) {
    const [state, action, pending] = useActionState<FormState, FormData>(resetRecruiterPassword, {});
    const errors = state.fieldErrors ?? {};

    return (
        <form action={action} className="mt-9 space-y-5">
            <input type="hidden" name="token" value={token} />

            {state.error && (
                <p
                    role="alert"
                    className="rounded-[8px] border border-red-200 bg-red-50 p-3 text-[14px] text-red-700"
                >
                    {state.error}
                </p>
            )}

            <div>
                <PillInput
                    icon="/assets/lock_icon.svg"
                    label="New password"
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

            <PillInput
                icon="/assets/lock_icon.svg"
                label="Confirm password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                error={errors.confirmPassword}
                required
            />

            <button
                type="submit"
                disabled={pending}
                className="flex h-[53px] w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-[#007AFF] text-[18px] text-white transition-colors hover:bg-[#0068D9] disabled:cursor-not-allowed disabled:opacity-80"
            >
                {pending && <ButtonSpinner />}
                {pending ? "Saving..." : "Reset password"}
            </button>
        </form>
    );
}