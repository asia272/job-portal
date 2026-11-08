import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import type { JobCategory, JobLevel } from "../src/generated/prisma/client";

if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed in production");
}
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is missing");

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

const SEED_DOMAIN = "@seed.insiderjobs.example"; // reserved TLD: can never receive real mail
const DEMO_PASSWORD = "Demo@12345";
const PLACEHOLDER_RESUME = "https://example.com/seed-resume.pdf"; // not a real file
const CLEAN_ONLY = process.argv.includes("--clean");

const COMPANIES = [
    { name: "Northwind Labs", handle: "northwind" },
    { name: "Bluepeak Technologies", handle: "bluepeak" },
    { name: "Orbit Systems", handle: "orbit" },
    { name: "Lumen Works", handle: "lumen" },
    { name: "Crestline Group", handle: "crestline" },
    { name: "Brightway Digital", handle: "brightway" },
];

const LOCATIONS = ["Bangalore", "Hyderabad", "Mumbai", "Chennai", "Lahore", "Karachi", "Dubai", "Remote"];
const CATEGORIES: JobCategory[] = ["PROGRAMMING", "MARKETING", "DESIGNING", "ACCOUNTING", "ANALYTICS"];
const LEVELS: JobLevel[] = ["BEGINNER", "INTERMEDIATE", "SENIOR"];
const BASE_SALARY: Record<JobLevel, number> = { BEGINNER: 30000, INTERMEDIATE: 55000, SENIOR: 95000 };

const TEMPLATES: Record<
    JobCategory,
    { titles: string[]; focus: string; responsibilities: string[]; skills: string[] }
> = {
    PROGRAMMING: {
        titles: ["Full Stack Developer", "Frontend Developer", "Backend Developer", "DevOps Engineer", "Mobile App Developer", "QA Automation Engineer"],
        focus: "build and ship reliable software used by thousands of people every day",
        responsibilities: [
            "Build, test and deploy new features from design to production.",
            "Write clean, maintainable and well-documented code.",
            "Review pull requests and share knowledge with the team.",
            "Monitor performance and fix bugs quickly.",
            "Work with product and design to shape technical solutions.",
        ],
        skills: [
            "Strong knowledge of JavaScript or TypeScript.",
            "Experience with React, Node.js or a similar modern stack.",
            "Familiarity with SQL databases such as PostgreSQL.",
            "Comfortable with Git and code review workflows.",
            "Good communication and collaboration skills.",
        ],
    },
    MARKETING: {
        titles: ["Digital Marketing Manager", "SEO Specialist", "Content Strategist", "Social Media Manager"],
        focus: "grow our audience and turn campaigns into measurable results",
        responsibilities: [
            "Plan and run multi-channel marketing campaigns.",
            "Create and schedule engaging content for our channels.",
            "Track campaign performance and report on key metrics.",
            "Research competitors and market trends.",
            "Collaborate with sales and design on launches.",
        ],
        skills: [
            "Proven experience in digital marketing or content creation.",
            "Familiarity with analytics and SEO tools.",
            "Excellent written and verbal communication.",
            "Creative thinking and attention to detail.",
            "Ability to manage several projects at once.",
        ],
    },
    DESIGNING: {
        titles: ["UI/UX Designer", "Graphic Designer", "Product Designer", "Motion Designer"],
        focus: "craft clear, beautiful and accessible experiences for our customers",
        responsibilities: [
            "Turn product ideas into wireframes, prototypes and polished designs.",
            "Maintain and extend our design system.",
            "Run user research and usability tests.",
            "Hand off designs clearly to engineers.",
            "Present and defend design decisions to stakeholders.",
        ],
        skills: [
            "A strong portfolio showing end-to-end design work.",
            "Proficiency in Figma or similar design tools.",
            "Understanding of accessibility and responsive design.",
            "Good visual sense: typography, color and layout.",
            "Open to feedback and iteration.",
        ],
    },
    ACCOUNTING: {
        titles: ["Accountant", "Financial Analyst", "Payroll Specialist", "Internal Auditor"],
        focus: "keep our finances accurate, compliant and easy to understand",
        responsibilities: [
            "Prepare and review monthly financial statements.",
            "Manage accounts payable, receivable and reconciliations.",
            "Support budgeting, forecasting and audits.",
            "Ensure compliance with tax and regulatory rules.",
            "Improve finance processes and reporting.",
        ],
        skills: [
            "Degree in accounting, finance or a related field.",
            "Hands-on experience with accounting software and Excel.",
            "Strong knowledge of accounting principles and tax rules.",
            "High accuracy and attention to detail.",
            "Ability to meet deadlines under pressure.",
        ],
    },
    ANALYTICS: {
        titles: ["Data Analyst", "Data Scientist", "BI Developer", "Analytics Engineer"],
        focus: "turn raw data into insights that guide business decisions",
        responsibilities: [
            "Collect, clean and analyze data from multiple sources.",
            "Build dashboards and reports for business teams.",
            "Design experiments and measure their impact.",
            "Explain findings clearly to non-technical audiences.",
            "Keep data pipelines accurate and well documented.",
        ],
        skills: [
            "Strong SQL skills and experience with Python or R.",
            "Experience with BI tools such as Power BI or Tableau.",
            "Solid understanding of statistics.",
            "Clear data storytelling and communication.",
            "Curiosity and a structured approach to problem solving.",
        ],
    },
};

function intro(title: string, company: string, focus: string) {
    return `${company} is looking for a ${title} to join our growing team. In this role you will help us ${focus}, working closely with colleagues across the company.\n\nWe value clear communication, ownership and a habit of leaving things better than you found them. If you enjoy fast-paced environments and love solving real problems, we would love to meet you!`;
}

async function clean() {
    // Cascade removes the demo jobs and their applications too
    const r = await prisma.recruiter.deleteMany({ where: { email: { endsWith: SEED_DOMAIN } } });
    const c = await prisma.candidate.deleteMany({ where: { email: { endsWith: SEED_DOMAIN } } });
    console.log(`Removed ${r.count} demo recruiters (with their jobs) and ${c.count} demo candidates.`);
}

async function main() {
    await clean();
    if (CLEAN_ONLY) return;

    // Recruiters
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const recruiters: { id: string }[] = [];
    for (const company of COMPANIES) {
        const created = await prisma.recruiter.create({
            data: {
                name: `${company.name} HR`,
                email: `${company.handle}${SEED_DOMAIN}`,
                passwordHash,
                emailVerified: true,
                companyName: company.name,
            },
        });
        recruiters.push({ id: created.id });
    }

    // Jobs
    const now = Date.now();
    const jobs = Array.from({ length: 54 }, (_, i) => {
        const category = CATEGORIES[i % CATEGORIES.length];
        const tpl = TEMPLATES[category];
        const level = LEVELS[(i + Math.floor(i / 3)) % LEVELS.length];
        const companyIndex = i % COMPANIES.length;
        const title = tpl.titles[Math.floor(i / CATEGORIES.length) % tpl.titles.length];
        const hasSalary = i % 7 !== 6; // every 7th job shows "Not disclosed"
        const salaryMin = BASE_SALARY[level] + (i % 5) * 5000;

        return {
            title,
            description: intro(title, COMPANIES[companyIndex].name, tpl.focus),
            responsibilities: tpl.responsibilities,
            skills: tpl.skills,
            category,
            level,
            location: LOCATIONS[(i * 3) % LOCATIONS.length],
            salaryMin: hasSalary ? salaryMin : null,
            salaryMax: hasSalary ? salaryMin + 25000 : null,
            status: i % 11 === 10 ? ("INACTIVE" as const) : ("ACTIVE" as const), // a few inactive ones
            createdAt: new Date(now - (i * 6 + 1) * 3600_000),
            recruiterId: recruiters[companyIndex].id,
        };
    });
    await prisma.job.createMany({ data: jobs });

    // Candidates
    const names = ["Aisha Khan", "Rohan Mehta", "Sara Ahmed", "Daniel Cruz", "Priya Nair", "Omar Farooq", "Lina Haddad", "Kevin Brooks"];
    await prisma.candidate.createMany({
        data: names.map((name, n) => ({
            clerkId: `seed_user_${n + 1}`, // fake: does not match any real Clerk user
            email: `candidate${n + 1}${SEED_DOMAIN}`,
            name,
            resumeUrl: PLACEHOLDER_RESUME,
            resumeFileName: "resume.pdf",
        })),
    });
    const candidates = await prisma.candidate.findMany({
        where: { email: { endsWith: SEED_DOMAIN } },
        orderBy: { email: "asc" },
    });

    // Applications on the newest active jobs, mixed statuses
    const activeJobs = await prisma.job.findMany({
        where: { status: "ACTIVE", recruiter: { email: { endsWith: SEED_DOMAIN } } },
        orderBy: { createdAt: "desc" },
        take: 18,
    });
    const STATUSES = ["PENDING", "ACCEPTED", "REJECTED"] as const;
    const applications: {
        candidateId: string;
        jobId: string;
        resumeUrl: string;
        status: (typeof STATUSES)[number];
    }[] = [];
    activeJobs.forEach((job, j) =>
        candidates.forEach((candidate, k) => {
            if ((j + k) % 4 === 0) {
                applications.push({
                    candidateId: candidate.id,
                    jobId: job.id,
                    resumeUrl: PLACEHOLDER_RESUME,
                    status: STATUSES[(j + k) % 3],
                });
            }
        })
    );
    await prisma.application.createMany({ data: applications, skipDuplicates: true });

    console.log(
        `\nDone: ${recruiters.length} recruiters, ${jobs.length} jobs, ${candidates.length} candidates, ${applications.length} applications.`
    );
    console.log(`Demo recruiter login: northwind${SEED_DOMAIN}  /  ${DEMO_PASSWORD}`);
    console.log("Other handles: bluepeak, orbit, lumen, crestline, brightway (same password).");
}

main()
    .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());