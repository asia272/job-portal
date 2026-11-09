import Image from "next/image";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { SignUpButton, UserButton } from "@clerk/nextjs";

export default async function Navbar() {
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;

    return (
        <header>
            <div className="mx-auto flex h-[70px] w-full max-w-[1231px] items-center justify-between px-4">
                <Link href="/" aria-label="Insiderjobs home">
                    <Image
                        src="/assets/logo.svg"
                        alt="Insiderjobs"
                        width={180}
                        height={38}
                        priority
                        className="h-[38px] w-[180px]"
                    />
                </Link>

                {user ? (
                    <div className="flex items-center gap-5 text-[16px] text-[#424242]">
                        <Link href="/my-applications" className="transition-colors hover:text-[#0260FF]">
                            My Applications
                        </Link>
                        <span className="hidden sm:inline">Hi! {user.firstName}</span>
                        <UserButton />
                    </div>
                ) : (
                    <div className="flex items-center gap-5 sm:gap-[42px]">
                        <Link
                            href="/recruiter/login"
                            className="text-[16px] text-[#424242] transition-colors hover:text-[#0260FF]"
                        >
                            Recruiter Login
                        </Link>
                        <SignUpButton mode="modal">
                            <button
                                type="button"
                                className="h-[42px] cursor-pointer rounded-full bg-[#0260FF] px-[30px] text-[16px] text-white transition-colors hover:bg-[#0150D6] sm:px-[43px]"
                            >
                                Register
                            </button>
                        </SignUpButton>
                    </div>
                )}
            </div>
        </header>
    );
}