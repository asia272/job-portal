import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "recruiter_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

function getKey() {
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error("SESSION_SECRET is missing or shorter than 32 characters");
    }
    return new TextEncoder().encode(secret);
}

export async function signSessionToken(recruiterId: string) {
    return new SignJWT({})
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(recruiterId)
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(getKey());
}

export async function verifySessionToken(token: string) {
    const key = getKey();
    try {
        const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
        return payload.sub
            ? { recruiterId: payload.sub, issuedAt: payload.iat ?? 0 }
            : null;
    } catch {
        return null;
    }
}