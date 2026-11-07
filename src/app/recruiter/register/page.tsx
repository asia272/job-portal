import Link from "next/link";
import RegisterForm from "./register-form";

export default function RecruiterRegisterPage() {
    return (
        <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
            <Link href="/" className="mb-8 text-center text-2xl font-bold">
                Insiderjobs
            </Link>

            <div className="rounded-xl border p-6 shadow-sm">
                <h1 className="text-xl font-semibold">Create recruiter account</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Post jobs and hire the best talent. We will email you a link to verify your address.
                </p>

                <RegisterForm />

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/recruiter/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </main>
    );
}