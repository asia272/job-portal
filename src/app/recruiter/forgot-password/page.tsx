import Link from "next/link";
import ForgotForm from "./forgot-form";

export default function ForgotPasswordPage() {
    return (
        <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
            <Link href="/" className="mb-8 text-center text-2xl font-bold">
                Insiderjobs
            </Link>

            <div className="rounded-xl border p-6 shadow-sm">
                <h1 className="text-xl font-semibold">Forgot your password?</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Enter your recruiter email and we will send you a link to choose a new password.
                </p>

                <ForgotForm />

                <p className="mt-6 text-center text-sm text-gray-600">
                    <Link href="/recruiter/login" className="text-blue-600 hover:underline">
                        Back to login
                    </Link>
                </p>
            </div>
        </main>
    );
}