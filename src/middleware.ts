import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Check for auth token in cookies
    const token = request.cookies.get("authToken")?.value;
    const { pathname } = request.nextUrl;

    // Define protected routes pattern
    const protectedRoutes = [
        "/my-tickets",
        "/organizer",
        "/admin",
        "/staff",
        "/attendee"
    ];

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute && !token) {
        // Redirect to sign-in if accessing protected route without token
        const url = new URL("/sign-in", request.url);
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
