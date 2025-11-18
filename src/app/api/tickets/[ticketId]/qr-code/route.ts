import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { serverRuntimeConfig } from "@/config/server-env";

interface RouteParams {
  params: {
    ticketId: string;
  };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { ticketId } = params;

  if (!ticketId) {
    return NextResponse.json({ message: "ticketId is required" }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const authToken = cookieStore.get("authToken")?.value;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-User-Id": userId,
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(
      `${serverRuntimeConfig.backendApiUrl}/api/v1/tickets/${ticketId}/qr-codes`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json({ message: errorBody || "Failed to fetch QR code" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch ticket QR code", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

