import Image from "next/image";

const LOGOS = [
    { src: "/assets/microsoft_logo.svg", alt: "Microsoft", width: 104, height: 24 },
    { src: "/assets/walmart_logo.svg", alt: "Walmart", width: 95, height: 24 },
    { src: "/assets/accenture_logo.png", alt: "Accenture", width: 87, height: 28 },
];

export default function TrustedBy() {
    return (
        <section
            aria-label="Trusted by"
            className="mt-[45px] flex min-h-[80px] flex-wrap items-center gap-x-[56px] gap-y-4 rounded-[8px] border border-[#E1E1E1] bg-white/20 px-[30px] py-4"
        >
            <p className="text-[16px] text-[#797484]">Trusted by</p>
            {LOGOS.map((l) => (
                <Image
                    key={l.alt}
                    src={l.src}
                    alt={l.alt}
                    width={l.width}
                    height={l.height}
                    style={{ width: l.width, height: "auto" }}
                />
            ))}
        </section>
    );
}