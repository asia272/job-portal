"use client";
import { useActionState } from "react";
import { requestPasswordReset } from "@/actions/recruiter-auth";
import type { FormState } from "@/lib/form-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotForm() {
    const [state, action, pending] = useActionState<FormState, FormData>(requestPasswordReset, {});

    if (state.success) {
        return (
            <p className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                {state.success}
            </p>
        );
    }

    return (
        <form action={action} className="mt-6 space-y-4">
            {state.error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {state.error}
                </p>
            )}

            <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    defaultValue={state.values?.email}
                    required
                />
                {state.fieldErrors?.email && (
                    <p className="text-xs text-red-600">{state.fieldErrors.email}</p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Sending..." : "Send reset link"}
            </Button>
        </form>
    );
}