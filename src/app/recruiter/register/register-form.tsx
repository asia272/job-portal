"use client";
import { useActionState } from "react";
import { registerRecruiter } from "@/actions/recruiter-auth";
import type { FormState } from "@/lib/form-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Field({
    label,
    name,
    type = "text",
    defaultValue,
    error,
    autoComplete,
    hint,
}: {
    label: string;
    name: string;
    type?: string;
    defaultValue?: string;
    error?: string;
    autoComplete?: string;
    hint?: string;
}) {
    return (
        <div className="space-y-1">
            <label htmlFor={name} className="text-sm font-medium">{label}</label>
            <Input
                id={name}
                name={name}
                type={type}
                defaultValue={defaultValue}
                autoComplete={autoComplete}
                required
            />
            {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}

export default function RegisterForm() {
    const [state, action, pending] = useActionState<FormState, FormData>(registerRecruiter, {});
    const errors = state.fieldErrors ?? {};

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

            <Field label="Your name" name="name" autoComplete="name" defaultValue={state.values?.name} error={errors.name} />
            <Field label="Company name" name="companyName" autoComplete="organization" defaultValue={state.values?.companyName} error={errors.companyName} />
            <Field label="Work email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email} error={errors.email} />
            <Field
                label="Password"
                name="password"
                type="password"
                autoComplete="new-password"
                error={errors.password}
                hint="At least 8 characters, with a letter and a number."
            />

            <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Creating account..." : "Create account"}
            </Button>
        </form>
    );
}