"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { CATEGORIES } from "@/lib/constants";

type Counts = {
    categories: { category: string; _count: number }[];
    locations: { location: string; _count: number }[];
};

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

    const activeCategories = sp.getAll("category");
    const activeLocations = sp.getAll("location");
    const categoryCount = (v: string) => counts.categories.find((c) => c.category === v)?._count ?? 0;

    return (
        <aside className="space-y-8 text-sm">
            <div>
                <h3 className="mb-3 font-medium">Search by Categories</h3>
                <ul className="space-y-2">
                    {CATEGORIES.map((c) => (
                        <li key={c.value} className="flex items-center gap-2">
                            <Checkbox
                                id={`cat-${c.value}`}
                                checked={activeCategories.includes(c.value)}
                                onCheckedChange={() => toggle("category", c.value)}
                            />
                            <label htmlFor={`cat-${c.value}`} className="cursor-pointer text-gray-600">
                                {c.label} ({categoryCount(c.value)})
                            </label>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h3 className="mb-3 font-medium">Search by Location</h3>
                <ul className="space-y-2">
                    {counts.locations.map((l) => (
                        <li key={l.location} className="flex items-center gap-2">
                            <Checkbox
                                id={`loc-${l.location}`}
                                checked={activeLocations.includes(l.location)}
                                onCheckedChange={() => toggle("location", l.location)}
                            />
                            <label htmlFor={`loc-${l.location}`} className="cursor-pointer text-gray-600">
                                {l.location} ({l._count})
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}