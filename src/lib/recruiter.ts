import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRecruiterSession } from "@/lib/recruiter-session";

// Returns the logged-in, verified recruiter from the DB (or null)
export const getCurrentRecruiter = cache(async () => {
    const session = await getRecruiterSession();
    if (!session) return null;

    const recruiter = await prisma.recruiter.findUnique({
        where: { id: session.recruiterId },
        select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
            companyLogoUrl: true,
            passwordChangedAt: true,
            emailVerified: true,
        },
    });

    if (!recruiter || !recruiter.emailVerified) return null;

    // Session was issued before the last password change: reject it
    if (
        recruiter.passwordChangedAt &&
        session.issuedAt < Math.floor(recruiter.passwordChangedAt.getTime() / 1000)
    ) {
        return null;
    }

    return recruiter;

    return recruiter;
});

// Use this at the top of every recruiter page and every recruiter server action
export async function requireRecruiter() {
    const recruiter = await getCurrentRecruiter();
    if (!recruiter) redirect("/recruiter/login");
    return recruiter;
}