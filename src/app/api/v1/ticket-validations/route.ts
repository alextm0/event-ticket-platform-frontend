import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { serverRuntimeConfig } from "@/config/server-env";

const USE_MOCK_VALIDATION =
  process.env.USE_MOCK_TICKET_VALIDATION &&
  process.env.USE_MOCK_TICKET_VALIDATION.toLowerCase() === "true";

const MOCK_VALIDATION_RESULTS: Record<string, { status: number; body: unknown }> = {
  // Known good code
  "11111111-1111-1111-1111-111111111111": {
    status: 201,
    body: { message: "Ticket validated (mock)", ticketId: "11111111-1111-1111-1111-111111111111" },
  },
  // Known invalid / already used code
  "22222222-2222-2222-2222-222222222222": {
    status: 409,
    body: { message: "Ticket already checked in (mock)" },
  },
};

export async function POST(request: Request) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { ticketId } = await request.json();

    if (USE_MOCK_VALIDATION) {
      const mockResult =
        ticketId && typeof ticketId === "string"
          ? MOCK_VALIDATION_RESULTS[ticketId]
          : undefined;

      if (!mockResult) {
        return NextResponse.json({ message: "Ticket not found (mock)" }, { status: 404 });
      }

      return NextResponse.json(mockResult.body, { status: mockResult.status });
    }

    const { accessToken } = await user.currentSession.getTokens();
    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized: No access token" }, { status: 401 });
    }

    const backendResponse = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/ticket-validations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ticketId }),
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