import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";

const isCandidateRoute = createRouteMatcher(["/my-applications(.*)"]);
const isRecruiterRoute = createRouteMatcher(["/recruiter(.*)"]);
const isRecruiterPublic = createRouteMatcher([
    "/recruiter/login",
    "/recruiter/register",
    "/recruiter/verify-email",
]);

export default clerkMiddleware(async (auth, req) => {
    // Candidates: Clerk
    if (isCandidateRoute(req)) {
        await auth.protect();
        return;
    }

    // Recruiters: our own signed cookie
    if (isRecruiterRoute(req) && !isRecruiterPublic(req)) {
        const token = req.cookies.get(SESSION_COOKIE)?.value;
        const session = token ? await verifySessionToken(token) : null;
        if (!session) {
            return NextResponse.redirect(new URL("/recruiter/login", req.url));
        }
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};