import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { successResponse, handleRouteError } from "@/lib/api-response";

export async function POST() {
    try {
        const cookieStore = await cookies();

        // Clear all auth cookies with correct options
        // It's important to match path, secure, and sameSite attributes used during creation
        const options = {
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const, // Explicit casting for compatibility
        };

        cookieStore.delete({ name: "authToken", ...options });
        cookieStore.delete({ name: "userId", ...options });
        cookieStore.delete({ name: "userEmail", ...options });
        cookieStore.delete({ name: "userRole", ...options });

        // Also try deleting without options just in case
        cookieStore.delete("authToken");
        cookieStore.delete("userId");
        cookieStore.delete("userEmail");
        cookieStore.delete("userRole");

        return successResponse({ message: "Logged out successfully" });
    } catch (error) {
        return handleRouteError(error, "Logout error");
    }
}
