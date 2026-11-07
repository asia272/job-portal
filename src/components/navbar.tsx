import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default async function Navbar() {
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;

    return (
        <header className="border-b">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                <Link href="/" className="text-xl font-bold">Insiderjobs</Link>

                {user ? (
                    <div className="flex items-center gap-4">
                        <Link href="/my-applications" className="text-sm">My Applications</Link>
                        <span className="text-sm">Hi! {user.firstName}</span>
                        <UserButton />
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link href="/recruiter/login" className="text-sm">Recruiter Login</Link>
                        <SignUpButton mode="modal">
                            <Button className="rounded-full">Register</Button>
                        </SignUpButton>
                        <SignInButton mode="modal">
                            <Button variant="ghost">Login</Button>
                        </SignInButton>
                    </div>
                )}
            </div>
        </header>
    );
}