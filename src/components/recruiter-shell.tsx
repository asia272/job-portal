"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Briefcase,
    PlusCircle,
    Users,
    LogOut,
    Menu,
    X,
    Globe,
} from "lucide-react";
import { logoutRecruiter } from "@/actions/recruiter-auth";

type Props = {
    recruiter: { name: string; email: string; companyName: string };
    children: React.ReactNode;
};

const NAV = [
    { href: "/recruiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/recruiter/jobs", label: "My Jobs", icon: Briefcase },
    { href: "/recruiter/jobs/new", label: "Post a Job", icon: PlusCircle },
    { href: "/recruiter/applications", label: "Applications", icon: Users },
];

function isActive(pathname: string, href: string) {
    if (href === "/recruiter/jobs") {
        // "My Jobs" must not light up on the "Post a Job" page
        return (
            pathname === href ||
            (pathname.startsWith(href + "/") && !pathname.startsWith("/recruiter/jobs/new"))
        );
    }
    return pathname === href || pathname.startsWith(href + "/");
}

export default function RecruiterShell({ recruiter, children }: Props) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const title = NAV.find((n) => isActive(pathname, n.href))?.label ?? "Dashboard";
    const initial = recruiter.name.trim()[0]?.toUpperCase() ?? "R";

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-16 items-center justify-between border-b px-5">
                    <Link href="/recruiter/dashboard" className="text-xl font-bold">
                        Insider<span className="font-normal">jobs</span>
                    </Link>
                    <button
                        className="lg:hidden"
                        onClick={() => setOpen(false)}
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 p-3">
                    {NAV.map(({ href, label, icon: Icon }) => {
                        const active = isActive(pathname, href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active
                                        ? "bg-blue-50 font-medium text-blue-700"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t p-3">
                    <div className="mb-2 flex items-center gap-3 px-2 py-1">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                            {initial}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{recruiter.name}</p>
                            <p className="truncate text-xs text-gray-500">{recruiter.companyName}</p>
                        </div>
                    </div>
                    <form action={logoutRecruiter}>
                        <button
                            type="submit"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main column */}
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            className="lg:hidden"
                            onClick={() => setOpen(true)}
                            aria-label="Open menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <h1 className="text-lg font-semibold">{title}</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            target="_blank"
                            className="hidden items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 sm:flex"
                        >
                            <Globe className="h-4 w-4" />
                            View job board
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="hidden text-sm sm:block">Hi! {recruiter.name}</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                                {initial}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8">{children}</main>
            </div>
        </div>
    );
}