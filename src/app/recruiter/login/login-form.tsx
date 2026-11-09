"use client";
import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { loginRecruiter } from "@/actions/recruiter-auth";
import type { FormState } from "@/lib/form-state";

const PILL =
    "flex h-[50px] items-center gap-3 rounded-full border border-[#D6D6D6] bg-white px-5 transition-colors focus-within:border-[#007AFF]";
const INPUT =
    "w-full min-w-0 bg-transparent text-[16px] text-[#222222] outline-none placeholder:text-[#9D9D9D]";

export default function LoginForm() {
    const [state, action, pending] = useActionState<FormState, FormData>(loginRecruiter, {});

    return (
        <form action={action} className="mt-10">
            {state.error && (
                <p
                    role="alert"
                    className="mb-5 rounded-[8px] border border-red-200 bg-red-50 p-3 text-[14px] text-red-700"
                >
                    {state.error}
                </p>
            )}

            <label className={PILL}>
                <Image src="/assets/email_icon.svg" alt="" width={18} height={18} className="shrink-0" />
                <span className="sr-only">Email id</span>
                <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email id"
                    defaultValue={state.values?.email}
                    required
                    className={INPUT}
                />
            </label>

            <label className={`${PILL} mt-5`}>
                <Image src="/assets/lock_icon.svg" alt="" width={18} height={18} className="shrink-0" />
                <span className="sr-only">Password</span>
                <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    required
                    className={INPUT}
                />
            </label>

            <Link
                href="/recruiter/forgot-password"
                className="mt-8 inline-block text-[16px] text-[#006CE2] hover:underline"
            >
                Forgot password?
            </Link>

            <button
                type="submit"
                disabled={pending}
                className="mt-4 h-[53px] w-full cursor-pointer rounded-full bg-[#007AFF] text-[18px] text-white transition-colors hover:bg-[#0068D9] disabled:cursor-not-allowed disabled:opacity-70"
            >
                {pending ? "Signing in..." : "Login"}
            </button>

            <p className="mt-6 text-center text-[16px] text-[#797484]">
                Don&apos;t have an account?{" "}
                <Link href="/recruiter/register" className="text-[#006CE2] underline">
                    Sign up
                </Link>
            </p>
        </form>
    );
}