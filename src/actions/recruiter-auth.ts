"use server";
import bcrypt from "bcryptjs";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
    registerSchema,
    loginSchema,
    forgotSchema,
    resetSchema,
    toFieldErrors,
} from "@/lib/validations";
import { generateToken, hashToken } from "@/lib/tokens";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { createRecruiterSession, destroyRecruiterSession } from "@/lib/recruiter-session";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import type { FormState } from "@/lib/form-state";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TTL_MS = 60 * 60 * 1000;       // 1 hour
const BCRYPT_COST = 12;

// Keeps login timing the same whether or not the email exists
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_COST);

async function issueVerificationEmail(recruiter: { id: string; email: string; name: string }) {
    const { raw, hash } = generateToken();

    await prisma.$transaction([
        prisma.emailVerificationToken.deleteMany({ where: { recruiterId: recruiter.id } }),
        prisma.emailVerificationToken.create({
            data: {
                tokenHash: hash,
                recruiterId: recruiter.id,
                expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
            },
        }),
    ]);

    await sendVerificationEmail(recruiter.email, recruiter.name, raw);
}

// ---------------- REGISTER ----------------
export async function registerRecruiter(_prev: FormState, formData: FormData): Promise<FormState> {
    const input = {
        name: String(formData.get("name") ?? ""),
        companyName: String(formData.get("companyName") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
    };
    const values = { name: input.name, companyName: input.companyName, email: input.email };

    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
        return { fieldErrors: toFieldErrors(parsed.error.issues), values };
    }
    const { name, companyName, email, password } = parsed.data;

    const rl = await rateLimit("register", await getClientIp());
    if (!rl.ok) return { error: rl.message, values };

    try {
        const existing = await prisma.recruiter.findUnique({ where: { email } });

        if (!existing) {
            const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
            const recruiter = await prisma.recruiter.create({
                data: { name, companyName, email, passwordHash },
            });
            await issueVerificationEmail(recruiter);
        } else if (!existing.emailVerified) {
            const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
            const updated = await prisma.recruiter.update({
                where: { id: existing.id },
                data: { name, companyName, passwordHash },
            });
            await issueVerificationEmail(updated);
        }
        // Already verified: do nothing and show the same message (no email enumeration)
    } catch (e) {
        const duplicate = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
        if (!duplicate) {
            console.error("registerRecruiter failed:", e);
            return { error: "Something went wrong. Please try again.", values };
        }
    }

    return {
        success:
            "Almost done! If this email can be registered, we have sent a verification link to it. Check your inbox (and spam folder). The link is valid for 24 hours.",
    };
}

// ---------------- VERIFY EMAIL ----------------
export async function verifyRecruiterEmail(_prev: FormState, formData: FormData): Promise<FormState> {
    const token = String(formData.get("token") ?? "");
    if (!/^[a-f0-9]{64}$/.test(token)) {
        return { error: "This verification link is invalid." };
    }

    const rl = await rateLimit("verifyEmail", await getClientIp());
    if (!rl.ok) return { error: rl.message };

    const record = await prisma.emailVerificationToken.findUnique({
        where: { tokenHash: hashToken(token) },
    });

    if (!record || record.expiresAt < new Date()) {
        if (record) {
            await prisma.emailVerificationToken.delete({ where: { id: record.id } }).catch(() => { });
        }
        return {
            error:
                "This link is invalid or has expired. Log in with your email and password and we will send you a new one.",
        };
    }

    await prisma.$transaction([
        prisma.recruiter.update({
            where: { id: record.recruiterId },
            data: { emailVerified: true },
        }),
        prisma.emailVerificationToken.deleteMany({ where: { recruiterId: record.recruiterId } }),
    ]);

    await createRecruiterSession(record.recruiterId);
    redirect("/recruiter/dashboard");
}

// ---------------- LOGIN ----------------
export async function loginRecruiter(_prev: FormState, formData: FormData): Promise<FormState> {
    const values = { email: String(formData.get("email") ?? "") };

    const parsed = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });
    if (!parsed.success) return { error: "Invalid email or password", values };
    const { email, password } = parsed.data;

    // Rate limit BEFORE the expensive bcrypt compare
    const ip = await getClientIp();
    const byIp = await rateLimit("login", ip);
    if (!byIp.ok) return { error: byIp.message, values };
    const byAccount = await rateLimit("loginAccount", `${ip}:${email}`);
    if (!byAccount.ok) return { error: byAccount.message, values };

    const recruiter = await prisma.recruiter.findUnique({ where: { email } });
    const passwordOk = await bcrypt.compare(password, recruiter?.passwordHash ?? DUMMY_HASH);

    if (!recruiter || !passwordOk) return { error: "Invalid email or password", values };

    if (!recruiter.emailVerified) {
        try {
            await issueVerificationEmail(recruiter);
        } catch (e) {
            console.error("resend verification failed:", e);
        }
        return {
            error:
                "Your email is not verified yet. We have sent you a new verification link, please check your inbox.",
            values,
        };
    }

    await createRecruiterSession(recruiter.id);
    redirect("/recruiter/dashboard");
}

// ---------------- FORGOT PASSWORD ----------------
export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
    const values = { email: String(formData.get("email") ?? "") };

    const parsed = forgotSchema.safeParse({ email: formData.get("email") });
    if (!parsed.success) {
        return { fieldErrors: toFieldErrors(parsed.error.issues), values };
    }
    const { email } = parsed.data;

    const byIp = await rateLimit("forgotIp", await getClientIp());
    if (!byIp.ok) return { error: byIp.message, values };
    const byEmail = await rateLimit("forgotEmail", email);
    if (!byEmail.ok) return { error: byEmail.message, values };

    // The lookup and email run AFTER the response, so the reply takes the same
    // time whether or not the account exists (no email enumeration by timing).
    after(async () => {
        try {
            const recruiter = await prisma.recruiter.findUnique({ where: { email } });
            if (!recruiter) return;

            const { raw, hash } = generateToken();
            await prisma.$transaction([
                prisma.passwordResetToken.deleteMany({ where: { recruiterId: recruiter.id } }),
                prisma.passwordResetToken.create({
                    data: {
                        tokenHash: hash,
                        recruiterId: recruiter.id,
                        expiresAt: new Date(Date.now() + RESET_TTL_MS),
                    },
                }),
            ]);
            await sendPasswordResetEmail(recruiter.email, recruiter.name, raw);
        } catch (e) {
            console.error("requestPasswordReset failed:", e);
        }
    });

    return {
        success:
            "If an account exists for that email, we have sent a password reset link. It is valid for 1 hour. Check your spam folder too.",
    };
}

// ---------------- RESET PASSWORD ----------------
const INVALID_RESET = "This reset link is invalid or has expired. Please request a new one.";

export async function resetRecruiterPassword(_prev: FormState, formData: FormData): Promise<FormState> {
    const parsed = resetSchema.safeParse({
        token: formData.get("token"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
    });
    if (!parsed.success) {
        const fieldErrors = toFieldErrors(parsed.error.issues);
        if (fieldErrors.token) return { error: INVALID_RESET };
        return { fieldErrors };
    }
    const { token, password } = parsed.data;

    const rl = await rateLimit("resetPassword", await getClientIp());
    if (!rl.ok) return { error: rl.message };

    const record = await prisma.passwordResetToken.findUnique({
        where: { tokenHash: hashToken(token) },
    });
    if (!record) return { error: INVALID_RESET };

    // Atomic claim: only ONE request can delete (use) the token, and only before expiry
    const claimed = await prisma.passwordResetToken.deleteMany({
        where: { id: record.id, expiresAt: { gt: new Date() } },
    });
    if (claimed.count === 0) return { error: INVALID_RESET };

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

    await prisma.$transaction([
        prisma.recruiter.update({
            where: { id: record.recruiterId },
            data: {
                passwordHash,
                passwordChangedAt: new Date(), // invalidates every older session cookie
                emailVerified: true,           // the link proved they own this mailbox
            },
        }),
        prisma.passwordResetToken.deleteMany({ where: { recruiterId: record.recruiterId } }),
        prisma.emailVerificationToken.deleteMany({ where: { recruiterId: record.recruiterId } }),
    ]);

    await createRecruiterSession(record.recruiterId);
    redirect("/recruiter/dashboard");
}

// ---------------- LOGOUT ----------------
export async function logoutRecruiter() {
    await destroyRecruiterSession();
    redirect("/recruiter/login");
}