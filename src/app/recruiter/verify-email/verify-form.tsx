"use client";
import { useActionState } from "react";
import { verifyRecruiterEmail } from "@/actions/recruiter-auth";
import type { FormState } from "@/lib/form-state";
import { Button } from "@/components/ui/button";

export default function VerifyForm({ token }: { token: string }) {
    const [state, action, pending] = useActionState<FormState, FormData>(verifyRecruiterEmail, {});

    return (
        <form action={action} className="mt-6 space-y-4">
            <input type="hidden" name="token" value={token} />

            {state.error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {state.error}
                </p>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Verifying..." : "Verify my email"}
            </Button>
        </form>
    );
}