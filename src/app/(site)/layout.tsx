import { Suspense } from "react";
import Navbar from "@/components/navbar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Suspense fallback={<div className="h-[70px]" />}>
                <Navbar />
            </Suspense>
            {children}
        </>
    );
}