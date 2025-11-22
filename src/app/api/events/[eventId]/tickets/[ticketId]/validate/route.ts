import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverRuntimeConfig } from "@/config/server-env";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{
    eventId: string;
    ticketId: string;
  }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { eventId, ticketId } = await params;
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

    const backendUrl = `${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}/ticket-validations`;
    
    logger.logBackendRequest("POST", backendUrl, { eventId, ticketId });

    let backendResponse: Response;
    try {
      backendResponse = await fetch(backendUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify(backendBody),
      });
    } catch (fetchError) {
      logger.error("Failed to connect to backend API", { eventId, ticketId }, fetchError);
      return NextResponse.json(
        { message: "Failed to connect to backend API" },
        { status: 500 }
      );
    }

    logger.logBackendResponse(backendResponse.status, { eventId, ticketId });

    if (!backendResponse.ok) {
      const responseText = await backendResponse.text();
      let errorBody: any;
      try {
        errorBody = JSON.parse(responseText);
      } catch {
        errorBody = { message: "Validation failed" };
      }
      
      logger.logBackendError(backendResponse.status, errorBody, responseText, { eventId, ticketId });
      return NextResponse.json(errorBody, { status: backendResponse.status });
    }

    const responseText = await backendResponse.text();
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      logger.error("Failed to parse backend response as JSON", { eventId, ticketId, status: backendResponse.status }, parseError);
      return NextResponse.json(
        { message: "Backend returned invalid JSON response" },
        { status: 500 }
      );
    }
    
    // Format response according to the expected structure
    const formattedResponse = {
      valid: true,
      ticketId: data.ticketId || ticketId,
      eventId: parseInt(eventId) || eventId,
      status: data.status || "USED",
      message: data.message || "Ticket validated successfully",
      ...data, // Include any additional fields from backend
    };

    return NextResponse.json(formattedResponse, { status: 200 });
  } catch (error) {
    logger.error("Error validating ticket", {}, error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

