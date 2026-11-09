import { Suspense } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col max-w-[1391px] px-2 mx-auto">
            <Suspense fallback={<div className="h-[70px]" />}>
                <Navbar />
            </Suspense>
            <div className="flex-1">{children}</div>
            <Footer />
        </div>
    );
}