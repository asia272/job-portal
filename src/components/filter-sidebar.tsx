"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";

type Counts = {
    categories: { category: string; _count: number }[];
    locations: { location: string; _count: number }[];
};

const CHIP =
    "inline-flex h-[34px] items-center rounded-[4px] border px-4 text-[14px] shadow-[0px_4px_15px_0px_#0000000D]";
const CHIP_BLUE = `${CHIP} border-[#8BC3FF] bg-[#EFF5FF] text-[#3C7BD9]`;
const CHIP_RED = `${CHIP} border-[#FFBABA] bg-[#FFF5F3] text-[#E0574F]`;

export default function FilterSidebar({ counts }: { counts: Counts }) {
    const router = useRouter();
    const sp = useSearchParams();

    function toggle(key: "category" | "location", value: string) {
        const params = new URLSearchParams(sp.toString());
        const current = params.getAll(key);
        params.delete(key);
        params.delete("page"); // always go back to page 1 when a filter changes
        const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
        next.forEach((v) => params.append(key, v));
        router.push(`/?${params.toString()}`);
    }

    const q = sp.get("q")?.trim();
    const activeCategories = sp.getAll("category");
    const activeLocations = sp.getAll("location");
    const categoryCount = (v: string) => counts.categories.find((c) => c.category === v)?._count ?? 0;
    const categoryLabel = (v: string) => CATEGORIES.find((c) => c.value === v)?.label ?? v;

    const hasChips = Boolean(q) || activeCategories.length > 0 || activeLocations.length > 0;

    return (
        <aside className="space-y-9">
            {hasChips && (
                <section aria-label="Current search">
                    <h3 className="text-[18px] leading-[42px] font-medium text-[#424242]">Current Search</h3>
                    <div className="mt-1 flex flex-wrap gap-[14px]">
                        {q && <span className={CHIP_BLUE}>{q}</span>}
                        {activeCategories.map((c) => (
                            <span key={`c-${c}`} className={CHIP_BLUE}>{categoryLabel(c)}</span>
                        ))}
                        {activeLocations.map((l) => (
                            <span key={`l-${l}`} className={CHIP_RED}>{l}</span>
                        ))}
                    </div>
                </section>
            )}

            <section aria-label="Filter by category">
                <h3 className="mb-4 text-[18px] font-medium text-[#424242]">Search by Categories</h3>
                <ul className="space-y-[14px]">
                    {CATEGORIES.map((c) => (
                        <li key={c.value} className="flex items-center gap-3">
                            <input
                                id={`cat-${c.value}`}
                                type="checkbox"
                                checked={activeCategories.includes(c.value)}
                                onChange={() => toggle("category", c.value)}
                                className="size-[18px] cursor-pointer accent-[#0260FF]"
                            />
                            <label htmlFor={`cat-${c.value}`} className="cursor-pointer text-[16px] text-[#686868]">
                                {c.label} ({categoryCount(c.value)})
                            </label>
                        </li>
                    ))}
                </ul>
            </section>

            <section aria-label="Filter by location">
                <h3 className="mb-4 text-[18px] font-medium text-[#424242]">Search by Location</h3>
                <ul className="space-y-[14px]">
                    {counts.locations.map((l) => (
                        <li key={l.location} className="flex items-center gap-3">
                            <input
                                id={`loc-${l.location}`}
                                type="checkbox"
                                checked={activeLocations.includes(l.location)}
                                onChange={() => toggle("location", l.location)}
                                className="size-[18px] cursor-pointer accent-[#0260FF]"
                            />
                            <label htmlFor={`loc-${l.location}`} className="cursor-pointer text-[16px] text-[#686868]">
                                {l.location} ({l._count})
                            </label>
                        </li>
                    ))}
                </ul>
            </section>
        </aside>
    );
}