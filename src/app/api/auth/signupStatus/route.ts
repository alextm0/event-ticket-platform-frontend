import { NextResponse } from "next/server";
import { serverRuntimeConfig } from "@/config/server-env";
import { successResponse, handleRouteError } from "@/lib/api-response";

export async function GET() {
  try {
    const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/auth/signupStatus`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { enabled: false },
        { status: response.status }
      );
    }

    const data = await response.json();
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error, "SignupStatus error");
  }
}

