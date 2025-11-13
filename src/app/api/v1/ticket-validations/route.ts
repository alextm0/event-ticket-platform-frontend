import { NextResponse } from "next/server";
import { ensureAppProfile } from "@/lib/user-profile";
import { stackServerApp } from "@/stack/server";
import { serverRuntimeConfig } from "@/config/server-env";

export async function POST(request: Request) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { profile } = await ensureAppProfile(user, { allowGrant: false });
    if (!profile) {
      return NextResponse.json({ message: "Unauthorized: Missing profile" }, { status: 401 });
    }

    const { ticketId, eventId } = await request.json();
    if (!ticketId || !eventId) {
      return NextResponse.json({ message: "ticketId and eventId are required" }, { status: 400 });
    }

    const { accessToken } = await user.currentSession.getTokens();
    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized: No access token" }, { status: 401 });
    }

    const backendResponse = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}/ticket-validations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-User-Id": profile.appUserId,
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