import Image from "next/image";
import Link from "next/link";

const SOCIALS = [
    { href: "#", label: "Facebook", icon: "/assets/facebook_icon.svg" },
    { href: "#", label: "Twitter", icon: "/assets/twitter_icon.svg" },
    { href: "#", label: "Instagram", icon: "/assets/instagram_icon.svg" },
];

export default function Footer() {
    return (
        <footer>
            <div className="flex w-full flex-col items-center justify-between gap-5 py-8 sm:flex-row">
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
                    <Link href="/" aria-label="Insiderjobs home">
                        <Image
                            src="/assets/logo.svg"
                            alt="Insiderjobs"
                            width={140}
                            height={30}
                            className="h-[30px] w-[140px]"
                        />
                    </Link>

                    <span aria-hidden className="hidden h-6 w-px bg-[#BDBDBD] sm:block" />

                    <p className="text-center text-[15px] text-[#686868]">
                        Copyright © 2023 Insiderjobs | All right reserved.
                    </p>
                </div>

                <ul className="flex items-center gap-3">
                    {SOCIALS.map((s) => (
                        <li key={s.label}>
                            {/* Replace "#" with your real social profile links */}
                            <a
                                href={s.href}
                                aria-label={s.label}
                            >
                                <Image src={s.icon} alt="" width={38} height={38} className="size-[38px] transition-colors hover:bg-gray-100" />
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </footer>
    );
}