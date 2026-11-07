"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <section className="mt-6 rounded-2xl bg-gradient-to-br from-purple-900 to-black px-6 py-14 text-center text-white">
            <h1 className="text-3xl font-semibold md:text-4xl">Over 10,000+ jobs to apply</h1>
            <p className="mx-auto mt-3 max-w-md text-xs text-white/80">
                Your Next Big Career Move Starts Right Here - Explore The Best Job Opportunities
                And Take The First Step Toward Your Future!
            </p>
            <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-lg bg-white p-2 text-black">
                <div className="flex flex-1 items-center gap-2 px-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for jobs" className="w-full text-sm outline-none" />
                </div>
                <div className="hidden flex-1 items-center gap-2 border-l px-2 sm:flex">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="w-full text-sm outline-none" />
                </div>
                <Button type="submit">Search</Button>
            </form>
        </section>
    );
}