"use client";
import { useActionState } from "react";
import { verifyRecruiterEmail } from "@/actions/recruiter-auth";
import type { FormState } from "@/lib/form-state";
import { ButtonSpinner } from "@/components/loader";

export default function VerifyForm({ token }: { token: string }) {
    const [state, action, pending] = useActionState<FormState, FormData>(verifyRecruiterEmail, {});

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

            <button
                type="submit"
                disabled={pending}
                className="flex h-[53px] w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-[#007AFF] text-[18px] text-white transition-colors hover:bg-[#0068D9] disabled:cursor-not-allowed disabled:opacity-80"
            >
                {pending && <ButtonSpinner />}
                {pending ? "Verifying..." : "Verify my email"}
            </button>
        </form>
    );
}