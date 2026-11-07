import { cookies } from "next/headers";
import {
    SESSION_COOKIE,
    SESSION_MAX_AGE,
    signSessionToken,
    verifySessionToken,
} from "@/lib/session-token";

export async function createRecruiterSession(recruiterId: string) {
    const token = await signSessionToken(recruiterId);
    const store = await cookies();
    store.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
    });
}

export async function destroyRecruiterSession() {
    const store = await cookies();
    store.delete(SESSION_COOKIE);
}

export async function getRecruiterSession() {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    return token ? verifySessionToken(token) : null;
}