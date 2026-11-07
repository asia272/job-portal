import { randomBytes, createHash } from "crypto";

export function hashToken(raw: string) {
    return createHash("sha256").update(raw).digest("hex");
}

export function generateToken() {
    const raw = randomBytes(32).toString("hex"); // 64 hex chars, goes in the email link
    return { raw, hash: hashToken(raw) };       // only the hash is stored in the DB
}