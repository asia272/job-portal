"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

export default function HeroSearch() {
    const router = useRouter();
    const sp = useSearchParams();
    const [q, setQ] = useState(sp.get("q") ?? "");
    const [location, setLocation] = useState(sp.get("location") ?? "");

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const params = new URLSearchParams(sp.toString());
        params.delete("page");
        params.delete("q");
        params.delete("location");
        if (q.trim()) params.set("q", q.trim());
        if (location.trim()) params.set("location", location.trim());
        router.push(`/?${params.toString()}`);
    }

    return (
        <section className="mt-9 flex flex-col items-center rounded-[15px] bg-[linear-gradient(90deg,#4F0487_0%,#130121_100%)] px-4 py-12 text-center text-white lg:h-[354px] lg:pt-[65px] lg:pb-0">
            <h1 className="text-[28px] leading-[1.25] font-medium sm:text-[40px] sm:leading-[60px]">
                Over 10,000+ jobs to apply
            </h1>

            <p className="mt-[18px] max-w-[720px] text-[14px] leading-[22px] capitalize">
                Your Next Big Career Move Starts Right Here - Explore the Best Job Opportunities and Take
                the First Step Toward Your Future!
            </p>

            <form
                onSubmit={onSubmit}
                role="search"
                className="mt-8 flex h-[54px] w-full max-w-[599px] items-center rounded-[5px] bg-white p-[6px] text-[#424242] shadow-[0px_4px_15px_0px_#0000000D]"
            >
                <div className="flex flex-[2] items-center gap-3 px-3">
                    <Image src="/assets/search_icon.svg" alt="" width={20} height={20} className="shrink-0" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search for jobs"
                        aria-label="Search for jobs"
                        className="w-full min-w-0 bg-transparent text-[16px] outline-none placeholder:text-[#797484]"
                    />
                </div>

                <span aria-hidden className="hidden h-[30px] w-px bg-[#BDBDBD] sm:block" />

                <div className="hidden flex-1 items-center gap-3 px-4 sm:flex">
                    <Image src="/assets/location_icon.svg" alt="" width={20} height={20} className="shrink-0" />
                    <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Location"
                        aria-label="Location"
                        className="w-full min-w-0 bg-transparent text-[16px] outline-none placeholder:text-[#797484]"
                    />
                </div>

                <button
                    type="submit"
                    className="h-full w-[100px] shrink-0 cursor-pointer rounded-[5px] bg-[#0260FF] text-[16px] text-white transition-colors hover:bg-[#0150D6] sm:w-[146px]"
                >
                    Search
                </button>
            </form>
        </section>
    );
}