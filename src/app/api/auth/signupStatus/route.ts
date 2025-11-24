import { NextResponse } from "next/server";
import { serverRuntimeConfig } from "@/config/server-env";

export async function GET() {
  try {
    const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/auth/signupStatus`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // If backend returns error, default to enabled
      return NextResponse.json({ enabled: true });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("SignupStatus error:", error);
    // If backend is unreachable, default to enabled
    return NextResponse.json({ enabled: true });
  }
}

