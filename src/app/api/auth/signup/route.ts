import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverRuntimeConfig } from "@/config/server-env";
import { successResponse, handleRouteError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // 1. Forward signup request to backend
    const signupResponse = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, role }),
    });

    const signupData = await signupResponse.json();

    if (!signupResponse.ok) {
      return NextResponse.json(signupData, { status: signupResponse.status });
    }

    // 2. Automatically log the user in to get the token
    const loginResponse = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, role }),
    });

    if (!loginResponse.ok) {
      // If login fails for some reason, return the signup data but warn/don't set cookies
      // The user will have to login manually.
      console.warn("Auto-login after signup failed for user:", email);
      return NextResponse.json(signupData);
    }

    const loginData = await loginResponse.json();

    // Set cookies for server-side auth using login data
    const cookieStore = await cookies();
    cookieStore.set("authToken", loginData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    // Support both userId (LoginResponse) and id (UserResponse) conventions if needed, 
    // but the app seems to use "userId".
    cookieStore.set("userId", loginData.userId || signupData.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    cookieStore.set("userEmail", loginData.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    // Ensure role is string
    const userRole = loginData.role?.toString().toLowerCase() || role.toLowerCase();
    cookieStore.set("userRole", userRole, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // Return combined data or just login data (which has the token)
    return successResponse({
      ...signupData,
      token: loginData.token,
      userId: loginData.userId
    });
  } catch (error) {
    return handleRouteError(error, "Signup error");
  }
}

