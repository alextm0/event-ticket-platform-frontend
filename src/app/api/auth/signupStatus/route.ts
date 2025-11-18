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

