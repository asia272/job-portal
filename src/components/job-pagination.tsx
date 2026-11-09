"use client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const BOX = "flex h-8 w-8 items-center justify-center rounded-[4px] border text-[14px]";

export default function JobPagination({ page, totalPages }: { page: number; totalPages: number }) {
    const sp = useSearchParams();
    if (totalPages <= 1) return null;

    const href = (p: number) => {
        const params = new URLSearchParams(sp.toString());
        params.set("page", String(p));
        return `/?${params.toString()}`;
    };

    return (
        <nav aria-label="Pagination" className="mt-[43px] flex flex-wrap items-center justify-center gap-[10px]">
            {page > 1 ? (
                <Link href={href(page - 1)} aria-label="Previous page" className={`${BOX} border-[#D1D5DB] hover:bg-gray-50`}>
                    <Image src="/assets/left_arrow_icon.svg" alt="" width={16} height={16} />
                </Link>
            ) : (
                <span aria-disabled className={`${BOX} border-[#D1D5DB] opacity-40`}>
                    <Image src="/assets/left_arrow_icon.svg" alt="" width={16} height={16} />
                </span>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                    key={p}
                    href={href(p)}
                    aria-label={`Page ${p}`}
                    aria-current={p === page ? "page" : undefined}
                    className={`${BOX} ${p === page
                            ? "border-[#6B7280] bg-[#EFF5FF] text-[#424242]"
                            : "border-[#D1D5DB] text-[#686868] hover:bg-gray-50"
                        }`}
                >
                    {p}
                </Link>
            ))}

            {page < totalPages ? (
                <Link href={href(page + 1)} aria-label="Next page" className={`${BOX} border-[#D1D5DB] hover:bg-gray-50`}>
                    <Image src="/assets/right_arrow_icon.svg" alt="" width={16} height={16} />
                </Link>
            ) : (
                <span aria-disabled className={`${BOX} border-[#D1D5DB] opacity-40`}>
                    <Image src="/assets/right_arrow_icon.svg" alt="" width={16} height={16} />
                </span>
            )}
        </nav>
    );
}