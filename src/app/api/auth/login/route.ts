import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverRuntimeConfig } from "@/config/server-env";
import { successResponse, handleRouteError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Forward request to backend (role is no longer required)
    const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Set cookies for server-side auth
    const cookieStore = await cookies();
    cookieStore.set("authToken", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    cookieStore.set("userId", data.userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    cookieStore.set("userEmail", data.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    cookieStore.set("userRole", data.role?.toLowerCase(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error, "Login error");
  }
}

