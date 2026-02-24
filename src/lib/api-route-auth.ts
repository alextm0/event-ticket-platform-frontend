import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { AppRole } from "@/lib/user-profile";

export interface RouteAuthContext {
  userId: string | null;
  authToken: string | null;
  userRole: AppRole | null;
}

export async function getAuthFromCookies(): Promise<RouteAuthContext> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value ?? null;
  const authToken = cookieStore.get("authToken")?.value ?? null;
  const roleValue = cookieStore.get("userRole")?.value ?? null;

  const validRoles: AppRole[] = ["admin", "organizer", "staff", "attendee"];
  const userRole =
    roleValue && validRoles.includes(roleValue as AppRole)
      ? (roleValue as AppRole)
      : null;

  return { userId, authToken, userRole };
}

/**
 * Helper for API routes.
 * - If unauthenticated, returns a 401 NextResponse.
 * - If requiredRole is provided and doesn't match, returns 403.
 * - Otherwise returns auth context.
 *
 * Usage in route:
 *   const auth = await requireRouteAuth("staff");
 *   if (auth instanceof NextResponse) return auth;
 *   const { userId, authToken, userRole } = auth;
 */
export async function requireRouteAuth(
  requiredRole?: AppRole,
): Promise<RouteAuthContext | NextResponse> {
  const { userId, authToken, userRole } = await getAuthFromCookies();

  if (!authToken || !userId) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in." },
      { status: 401 },
    );
  }

  if (requiredRole && userRole !== requiredRole) {
    return NextResponse.json(
      { error: `Forbidden: ${requiredRole} role required.` },
      { status: 403 },
    );
  }

  return { userId, authToken, userRole };
}

