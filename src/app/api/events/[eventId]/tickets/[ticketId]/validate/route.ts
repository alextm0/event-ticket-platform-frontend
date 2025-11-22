import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverRuntimeConfig } from "@/config/server-env";

interface RouteParams {
  params: {
    eventId: string;
    ticketId: string;
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { eventId, ticketId } = params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const userRole = cookieStore.get("userRole")?.value;
    const authToken = cookieStore.get("authToken")?.value;

    // Validate required parameters
    if (!eventId || !ticketId) {
      return NextResponse.json(
        { message: "eventId and ticketId are required" },
        { status: 400 }
      );
    }

    // Check authentication
    if (!userId || !authToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only staff can validate tickets
    if (userRole !== "staff") {
      return NextResponse.json(
        { message: "Unauthorized: Staff role required" },
        { status: 403 }
      );
    }

    // Parse optional body for code and organizerId
    let code: string | undefined;
    let organizerId: number | undefined;
    
    try {
      const contentType = request.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const requestBody = await request.json();
        code = requestBody.code;
        organizerId = requestBody.organizerId;
      }
    } catch {
      // Body is optional, so we can ignore parse errors
    }

    const scannedCode = code || ticketId; // Use provided code or fallback to ticketId

    // Build request body for backend
    const backendBody: any = { qrCodeId: scannedCode };
    if (organizerId) {
      backendBody.organizerId = organizerId;
    }

    // Forward request to backend API
    const backendResponse = await fetch(
      `${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}/ticket-validations`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify(backendBody),
      }
    );

    if (!backendResponse.ok) {
      const errorBody = await backendResponse.json().catch(() => ({
        message: "Validation failed",
      }));
      return NextResponse.json(errorBody, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    
    // Format response according to the expected structure
    const response = {
      valid: true,
      ticketId: data.ticketId || ticketId,
      eventId: parseInt(eventId) || eventId,
      status: data.status || "USED",
      message: data.message || "Ticket validated successfully",
      ...data, // Include any additional fields from backend
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error validating ticket:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

