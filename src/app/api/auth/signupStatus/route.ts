import { NextResponse } from "next/server";
import { serverRuntimeConfig } from "@/config/server-env";

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
    return NextResponse.json(data);
  } catch (error) {
    console.error("SignupStatus error:", error);
    return NextResponse.json(
      { enabled: false },
      { status: 500 }
    );
  }
}

