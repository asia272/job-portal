import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const getCurrentCandidate = cache(async () => {
    const { userId } = await auth();
    if (!userId) return null;

    const existing = await prisma.candidate.findUnique({ where: { clerkId: userId } });
    if (existing) return existing;

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!user || !email) return null;

    return prisma.candidate.upsert({
        where: { clerkId: userId },
        update: {},
        create: {
            clerkId: userId,
            email,
            name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
            imageUrl: user.imageUrl,
        },
    });
});