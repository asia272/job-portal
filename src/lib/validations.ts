import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    companyName: z.string().trim().min(2, "Company name must be at least 2 characters").max(120),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(72, "Password must be at most 72 characters")
        .regex(/[A-Za-z]/, "Password must contain a letter")
        .regex(/[0-9]/, "Password must contain a number"),
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