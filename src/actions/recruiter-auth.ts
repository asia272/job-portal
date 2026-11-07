"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { registerSchema, loginSchema, toFieldErrors } from "@/lib/validations";
import { generateToken, hashToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { createRecruiterSession, destroyRecruiterSession } from "@/lib/recruiter-session";
import type { FormState } from "@/lib/form-state";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const BCRYPT_COST = 12;

// Used so login takes the same time whether or not the email exists
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_COST);

async function issueVerificationEmail(recruiter: { id: string; email: string; name: string }) {
    const { raw, hash } = generateToken();

    // One active token per recruiter: delete old ones, create the new one
    await prisma.$transaction([
        prisma.emailVerificationToken.deleteMany({ where: { recruiterId: recruiter.id } }),
        prisma.emailVerificationToken.create({
            data: {
                tokenHash: hash,
                recruiterId: recruiter.id,
                expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
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

    try {
        const existing = await prisma.recruiter.findUnique({ where: { email } });

        if (!existing) {
            const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
            const recruiter = await prisma.recruiter.create({
                data: { name, companyName, email, passwordHash },
            });
            await issueVerificationEmail(recruiter);
        } else if (!existing.emailVerified) {
            // Unverified account: overwrite with the newest submission, so nobody can
            // pre-register someone else's email with a password they know, then resend the link.
            const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
            const updated = await prisma.recruiter.update({
                where: { id: existing.id },
                data: { name, companyName, passwordHash },
            });
            await issueVerificationEmail(updated);
        }
        // Already verified: do nothing, and show the same message (no email enumeration)
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

    // Token proved email ownership -> log in immediately
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

    const recruiter = await prisma.recruiter.findUnique({ where: { email } });
    const passwordOk = await bcrypt.compare(password, recruiter?.passwordHash ?? DUMMY_HASH);

    // Same message for "no such email" and "wrong password"
    if (!recruiter || !passwordOk) return { error: "Invalid email or password", values };

    // Correct password but not verified yet: send a fresh link
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

// ---------------- LOGOUT ----------------
export async function logoutRecruiter() {
    await destroyRecruiterSession();
    redirect("/recruiter/login");
}