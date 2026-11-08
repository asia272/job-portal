import { headers } from "next/headers";

export type LimitResult = { ok: true } | { ok: false; message: string };

export type RuleName =
    | "login"
    | "loginAccount"
    | "register"
    | "verifyEmail"
    | "forgotIp"
    | "forgotEmail"
    | "resetPassword"
    | "apply"
    | "createJob";

export async function getClientIp() {
    const h = await headers();
    return (
        h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        h.get("x-real-ip") ||
        "unknown"
    );
}

// Rate limiting is turned OFF for now: every request is allowed.
// Later, replace the body of this function with a real limiter
// (Upstash, or a database table) and no other file needs to change.
export async function rateLimit(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _name: RuleName,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _key: string
): Promise<LimitResult> {
    return { ok: true };
}