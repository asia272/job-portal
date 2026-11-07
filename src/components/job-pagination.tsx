"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function JobPagination({ page, totalPages }: { page: number; totalPages: number }) {
    const sp = useSearchParams();
    if (totalPages <= 1) return null;

    const href = (p: number) => {
        const params = new URLSearchParams(sp.toString());
        params.set("page", String(p));
        return `/?${params.toString()}`;
    };

    const box = "flex h-8 w-8 items-center justify-center rounded border text-sm";

    return (
        <nav className="mt-8 flex items-center justify-center gap-2">
            {page > 1 ? (
                <Link href={href(page - 1)} className={box}><ChevronLeft className="h-4 w-4" /></Link>
            ) : (
                <span className={`${box} opacity-40`}><ChevronLeft className="h-4 w-4" /></span>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={href(p)} className={`${box} ${p === page ? "border-blue-300 bg-blue-100 text-blue-700" : ""}`}>
                    {p}
                </Link>
            ))}

            {page < totalPages ? (
                <Link href={href(page + 1)} className={box}><ChevronRight className="h-4 w-4" /></Link>
            ) : (
                <span className={`${box} opacity-40`}><ChevronRight className="h-4 w-4" /></span>
            )}
        </nav>
    );
}