"use client";
import { useActionState } from "react";
import { resetRecruiterPassword } from "@/actions/recruiter-auth";
import type { FormState } from "@/lib/form-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetForm({ token }: { token: string }) {
    const [state, action, pending] = useActionState<FormState, FormData>(resetRecruiterPassword, {});
    const errors = state.fieldErrors ?? {};

    return (
        <form action={action} className="mt-6 space-y-4">
            <input type="hidden" name="token" value={token} />

            {state.error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {state.error}
                </p>
            )}

            <div className="space-y-1">
                <label htmlFor="password" className="text-sm font-medium">New password</label>
                <Input id="password" name="password" type="password" autoComplete="new-password" required />
                {errors.password ? (
                    <p className="text-xs text-red-600">{errors.password}</p>
                ) : (
                    <p className="text-xs text-gray-500">At least 8 characters, with a letter and a number.</p>
                )}
            </div>

            <div className="space-y-1">
                <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</label>
                <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
                {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Saving..." : "Reset password"}
            </Button>
        </form>
    );
}