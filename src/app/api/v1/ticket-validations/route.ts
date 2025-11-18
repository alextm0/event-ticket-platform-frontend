import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverRuntimeConfig } from "@/config/server-env";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const userRole = cookieStore.get("userRole")?.value;
    const authToken = cookieStore.get("authToken")?.value;

    if (!userId || !authToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only staff can validate tickets
    if (userRole !== "staff") {
      return NextResponse.json({ message: "Unauthorized: Staff role required" }, { status: 403 });
    }

    const { ticketId, eventId } = await request.json();
    if (!ticketId || !eventId) {
      return NextResponse.json({ message: "ticketId and eventId are required" }, { status: 400 });
    }

    const backendResponse = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}/ticket-validations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
        "X-User-Id": userId,
      },
      body: JSON.stringify({ qrCodeId: ticketId }),
    });

    if (!backendResponse.ok) {
      const errorBody = await backendResponse.json();
      return NextResponse.json(errorBody, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error("Error validating ticket:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
