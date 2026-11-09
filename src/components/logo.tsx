import Image from "next/image";
import Link from "next/link";

export default function Logo({
    href = "/",
    width = 180,
    height = 38,
    priority = false,
}: {
    href?: string;
    width?: number;
    height?: number;
    priority?: boolean;
}) {
    return (
        <Link href={href} aria-label="Insiderjobs home" className="inline-block shrink-0">
            <Image
                src="/assets/logo.svg"
                alt="Insiderjobs"
                width={width}
                height={height}
                priority={priority}
                style={{ width, height }}
            />
        </Link>
    );
}