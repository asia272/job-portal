import Link from "next/link";
import Logo from "@/components/logo";

export default function AuthCard({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#F4F5F7] px-4 py-10">
            <div className="mb-8">
                <Logo priority />
            </div>

            <div className="w-full max-w-[463px] rounded-[16px] bg-white px-6 pt-[52px] pb-[52px] shadow-[0px_4px_15px_0px_#0000000D] sm:px-[54px]">
                <h1 className="text-center text-[32px] leading-[40px] font-medium text-[#222222]">
                    {title}
                </h1>
                {subtitle && (
                    <p className="mt-3 text-center text-[15px] leading-6 text-[#3F3A7A]">{subtitle}</p>
                )}
                {children}
            </div>

            <p className="mt-6 text-center text-[14px] text-[#797484]">
                Looking for a job?{" "}
                <Link href="/" className="text-[#006CE2] underline">
                    Go to job seeker side
                </Link>
            </p>
        </main>
    );
}