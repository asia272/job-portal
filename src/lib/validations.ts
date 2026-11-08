import { z } from "zod";




export const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number");

export const registerSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    companyName: z.string().trim().min(2, "Company name must be at least 2 characters").max(120),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: passwordSchema,
});

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1).max(72),
});

export function toFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
    const out: Record<string, string> = {};
    for (const issue of issues) {
        const key = String(issue.path[0]);
        if (!out[key]) out[key] = issue.message;
    }
    return out;
}

const optionalInt = z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().int().min(0).max(100_000_000).optional()
);

export const jobSchema = z
    .object({
        title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
        description: z
            .string()
            .trim()
            .min(30, "Description must be at least 30 characters")
            .max(5000),
        category: z.enum(["PROGRAMMING", "MARKETING", "DESIGNING", "ACCOUNTING", "ANALYTICS"]),
        level: z.enum(["BEGINNER", "INTERMEDIATE", "SENIOR"]),
        location: z.string().trim().min(2, "Enter a location").max(100),
        salaryMin: optionalInt,
        salaryMax: optionalInt,
        responsibilities: z.array(z.string().max(300)).max(20, "Maximum 20 lines"),
        skills: z.array(z.string().max(300)).max(20, "Maximum 20 lines"),
    })
    .refine(
        (d) => d.salaryMin == null || d.salaryMax == null || d.salaryMin <= d.salaryMax,
        { message: "Maximum salary must be greater than minimum", path: ["salaryMax"] }
    );


export const forgotSchema = z.object({
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export const resetSchema = z
    .object({
        token: z.string().regex(/^[a-f0-9]{64}$/),
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });