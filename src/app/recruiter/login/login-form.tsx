"use client";
import { useActionState } from "react";
import { loginRecruiter } from "@/actions/recruiter-auth";
import type { FormState } from "@/lib/form-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "lucide-react";

export default function LoginForm() {
    const [state, action, pending] = useActionState<FormState, FormData>(loginRecruiter, {});

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
            </div>

            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                    <Link href="/recruiter/forgot-password" className="text-xs text-blue-600 hover:underline">
                        Forgot password?
                    </Link>
                </div>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                />
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Signing in..." : "Login"}
            </Button>
        </form>
    );
}