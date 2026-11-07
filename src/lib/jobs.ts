import { Prisma, JobCategory } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const PAGE_SIZE = 9;

export type JobFilters = {
    q?: string;
    locations: string[];
    categories: JobCategory[];
    page: number;
};

export async function getJobs({ q, locations, categories, page }: JobFilters) {
    const and: Prisma.JobWhereInput[] = [{ status: "ACTIVE" }];

    if (q) {
        and.push({
            OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
            ],
        });
    }
    if (categories.length) and.push({ category: { in: categories } });
    if (locations.length) {
        and.push({
            OR: locations.map((l) => ({ location: { contains: l, mode: "insensitive" as const } })),
        });
    }

    const where: Prisma.JobWhereInput = { AND: and };

    const [jobs, total] = await Promise.all([
        prisma.job.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            include: { recruiter: { select: { companyName: true, companyLogoUrl: true } } },
        }),
        prisma.job.count({ where }),
    ]);

    return { jobs, total, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export async function getFilterCounts() {
    const [categories, locations] = await Promise.all([
        prisma.job.groupBy({ by: ["category"], where: { status: "ACTIVE" }, _count: true }),
        prisma.job.groupBy({ by: ["location"], where: { status: "ACTIVE" }, _count: true }),
    ]);
    return { categories, locations };
}