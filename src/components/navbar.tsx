import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { SignUpButton, UserButton } from "@clerk/nextjs";
import { getCurrentRecruiter } from "@/lib/recruiter";
import { logoutRecruiter } from "@/actions/recruiter-auth";
import Logo from "@/components/logo";

const LINK = "text-[16px] text-[#424242] transition-colors hover:text-[#0260FF]";

export default async function Navbar() {
    const { userId } = await auth();
    const candidate = userId ? await currentUser() : null;
    // Only check the recruiter cookie when no candidate is logged in
    const recruiter = candidate ? null : await getCurrentRecruiter();

    return (
        <header>
            <div className=" flex h-[70px] w-full  items-center justify-between px-4">
                <Logo priority />

                {candidate ? (
                    <div className="flex items-center gap-4 sm:gap-6">
                        <Link href="/my-applications" className={LINK}>
                            My Applications
                        </Link>
                        <span className="hidden text-[16px] text-[#424242] sm:inline">
                            Hi! {candidate.firstName}
                        </span>
                        <UserButton />
                    </div>
                ) : recruiter ? (
                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link href="/recruiter/dashboard" className={LINK}>
                            Dashboard
                        </Link>
                        <span className="hidden text-[16px] text-[#424242] sm:inline">
                            Hi! {recruiter.name}
                        </span>
                        <div
                            aria-hidden
                            className="flex size-9 items-center justify-center rounded-full bg-[#EFF5FF] text-[15px] font-medium text-[#0260FF]"
                        >
                            {recruiter.name.trim()[0]?.toUpperCase() ?? "R"}
                        </div>
                        <form action={logoutRecruiter}>
                            <button
                                type="submit"
                                className="h-9 cursor-pointer rounded-full border border-[#E1E1E1] px-4 text-[14px] text-[#424242] transition-colors hover:bg-gray-50"
                            >
                                Logout
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="flex items-center gap-5 sm:gap-[42px]">
                        <Link href="/recruiter/login" className={LINK}>
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