import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isCandidateRoute = createRouteMatcher(["/my-applications(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    if (isCandidateRoute(req)) await auth.protect();
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};