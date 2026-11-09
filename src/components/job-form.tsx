"use client";
import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/lib/form-state";
import { CATEGORIES, LEVEL_LABELS } from "@/lib/constants";
import { ButtonSpinner } from "@/components/loader";

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

const CONTROL =
    "w-full rounded-[8px] border border-[#D6D6D6] bg-white px-4 text-[15px] text-[#252525] outline-none transition-colors placeholder:text-[#9D9D9D] focus:border-[#007AFF]";
const INPUT = `${CONTROL} h-[48px]`;
const TEXTAREA = `${CONTROL} py-3 leading-[24px]`;

function Field({
    label,
    htmlFor,
    error,
    hint,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label htmlFor={htmlFor} className="mb-2 block text-[15px] font-medium text-[#252525]">
                {label}
            </label>
            {children}
            {hint && !error && <p className="mt-1.5 text-[13px] text-[#797484]">{hint}</p>}
            {error && <p className="mt-1.5 text-[13px] text-red-600">{error}</p>}
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
        <form
            action={formAction}
            className="space-y-6 rounded-[8px] border border-[#E1E1E1] bg-white p-5 shadow-[0px_4px_15px_0px_#0000000D] sm:p-8"
        >
            {state.error && (
                <p role="alert" className="rounded-[8px] border border-red-200 bg-red-50 p-3 text-[14px] text-red-700">
                    {state.error}
                </p>
            )}

            <Field label="Job title" htmlFor="title" error={e.title}>
                <input
                    id="title"
                    name="title"
                    defaultValue={v("title")}
                    placeholder="Full Stack Developer"
                    required
                    className={INPUT}
                />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Category" htmlFor="category" error={e.category}>
                    <select id="category" name="category" defaultValue={v("category")} required className={INPUT}>
                        <option value="" disabled>Select category</option>
                        {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Level" htmlFor="level" error={e.level}>
                    <select id="level" name="level" defaultValue={v("level")} required className={INPUT}>
                        <option value="" disabled>Select level</option>
                        {Object.entries(LEVEL_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </Field>
            </div>

            <Field label="Location" htmlFor="location" error={e.location}>
                <input
                    id="location"
                    name="location"
                    defaultValue={v("location")}
                    placeholder="Lahore"
                    required
                    className={INPUT}
                />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Minimum salary (optional)" htmlFor="salaryMin" error={e.salaryMin}>
                    <input
                        id="salaryMin"
                        name="salaryMin"
                        type="number"
                        min={0}
                        defaultValue={v("salaryMin")}
                        placeholder="50000"
                        className={INPUT}
                    />
                </Field>
                <Field label="Maximum salary (optional)" htmlFor="salaryMax" error={e.salaryMax}>
                    <input
                        id="salaryMax"
                        name="salaryMax"
                        type="number"
                        min={0}
                        defaultValue={v("salaryMax")}
                        placeholder="80000"
                        className={INPUT}
                    />
                </Field>
            </div>

            <Field label="Job description" htmlFor="description" error={e.description}>
                <textarea
                    id="description"
                    name="description"
                    rows={6}
                    defaultValue={v("description")}
                    required
                    className={TEXTAREA}
                />
            </Field>

            <Field label="Key responsibilities" htmlFor="responsibilities" error={e.responsibilities} hint="One per line.">
                <textarea
                    id="responsibilities"
                    name="responsibilities"
                    rows={5}
                    defaultValue={v("responsibilities")}
                    className={TEXTAREA}
                />
            </Field>

            <Field label="Skills required" htmlFor="skills" error={e.skills} hint="One per line.">
                <textarea
                    id="skills"
                    name="skills"
                    rows={5}
                    defaultValue={v("skills")}
                    className={TEXTAREA}
                />
            </Field>

            <div className="flex flex-wrap gap-3 pt-2">
                <button
                    type="submit"
                    disabled={pending}
                    className="flex h-[48px] min-w-[160px] cursor-pointer items-center justify-center gap-3 rounded-[5px] bg-[#0260FF] px-6 text-[16px] text-white shadow-[0px_4px_15px_0px_#0000000D] transition-colors hover:bg-[#0150D6] disabled:cursor-not-allowed disabled:opacity-80"
                >
                    {pending && <ButtonSpinner />}
                    {pending ? "Saving..." : submitLabel}
                </button>
                <Link
                    href="/recruiter/jobs"
                    className="inline-flex h-[48px] items-center rounded-[5px] border border-[#CFCFCF] px-6 text-[16px] text-[#686868] transition-colors hover:bg-gray-50"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}