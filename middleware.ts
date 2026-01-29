import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isVendorRoute = createRouteMatcher(["/vendor(.*)"]);

// Protected Consumer routes (those that require a user session)
const isProtectedRoute = createRouteMatcher([
    "/admin(.*)",
    "/vendor(.*)",
    "/consumer/bnpl(.*)",
    "/consumer/orders(.*)",
    "/consumer/wallet(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims, redirectToSignIn } = await auth();

    // 1. If user is not signed in and tries to access restricted routes
    if (!userId && isProtectedRoute(req)) {
        return redirectToSignIn();
    }

    // 2. Role-based redirection logic for authenticated users
    if (userId) {
        const role = (sessionClaims as any)?.metadata?.role;

        if (isAdminRoute(req) && role !== "admin") {
            return NextResponse.redirect(new URL("/", req.url));
        }

        // Allow access to onboarding even if role isn't synced yet
        // Update: Relaxed check to allow users without metadata in JWT to pass (handled by app layout)
        if (isVendorRoute(req) && !req.nextUrl.pathname.includes("/onboarding") && role && role !== "vendor") {
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
