"use client";
import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/lib/form-state";
import { CATEGORIES, LEVEL_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type JobFormInitial = {
    title: string;
    description: string;
    category: string;
    level: string;
    location: string;
    salaryMin: string;
    salaryMax: string;
    responsibilities: string;
    skills: string;
};

const inputClass =
    "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40";

function Field({
    label,
    error,
    hint,
    children,
}: {
    label: string;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium">{label}</label>
            {children}
            {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}

export default function JobForm({
    action,
    initial,
    submitLabel,
}: {
    action: (prev: FormState, formData: FormData) => Promise<FormState>;
    initial?: JobFormInitial;
    submitLabel: string;
}) {
    const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
    const e = state.fieldErrors ?? {};
    const v = (k: keyof JobFormInitial) => state.values?.[k] ?? initial?.[k] ?? "";

    return (
        <form action={formAction} className="space-y-5 rounded-xl border bg-white p-6">
            {state.error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {state.error}
                </p>
            )}

            <Field label="Job title" error={e.title}>
                <Input name="title" defaultValue={v("title")} placeholder="Full Stack Developer" required />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Category" error={e.category}>
                    <select name="category" defaultValue={v("category")} required className={inputClass}>
                        <option value="" disabled>Select category</option>
                        {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Level" error={e.level}>
                    <select name="level" defaultValue={v("level")} required className={inputClass}>
                        <option value="" disabled>Select level</option>
                        {Object.entries(LEVEL_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </Field>
            </div>

            <Field label="Location" error={e.location}>
                <Input name="location" defaultValue={v("location")} placeholder="Lahore" required />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Minimum salary (optional)" error={e.salaryMin}>
                    <Input name="salaryMin" type="number" min={0} defaultValue={v("salaryMin")} placeholder="50000" />
                </Field>
                <Field label="Maximum salary (optional)" error={e.salaryMax}>
                    <Input name="salaryMax" type="number" min={0} defaultValue={v("salaryMax")} placeholder="80000" />
                </Field>
            </div>

            <Field label="Job description" error={e.description}>
                <textarea name="description" rows={6} defaultValue={v("description")} required className={inputClass} />
            </Field>

            <Field label="Key responsibilities" error={e.responsibilities} hint="One per line.">
                <textarea name="responsibilities" rows={5} defaultValue={v("responsibilities")} className={inputClass} />
            </Field>

            <Field label="Skills required" error={e.skills} hint="One per line.">
                <textarea name="skills" rows={5} defaultValue={v("skills")} className={inputClass} />
            </Field>

            <div className="flex gap-3">
                <Button type="submit" disabled={pending}>
                    {pending ? "Saving..." : submitLabel}
                </Button>
                <Link
                    href="/recruiter/jobs"
                    className="inline-flex items-center rounded-md border px-4 text-sm text-gray-600 hover:bg-gray-50"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}