import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverRuntimeConfig } from "@/config/server-env";
import { logger } from "@/lib/logger";

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

    const backendUrl = `${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}/ticket-validations`;
    
    // Build request body - backend might expect validationMethod field
    const requestBody = {
      qrCodeId: ticketId,
      validationMethod: "SCAN",
    };

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
        body: JSON.stringify(requestBody),
      });
    } catch (fetchError) {
      logger.error("Failed to connect to backend API", { eventId, ticketId }, fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      return NextResponse.json(
        {
          message: "Failed to connect to backend API",
          error: errorMessage,
          backendUrl: process.env.NODE_ENV === "development" ? backendUrl : undefined,
        },
        { status: 500 }
      );
    }

    logger.logBackendResponse(backendResponse.status, { eventId, ticketId });

    if (!backendResponse.ok) {
      // Try to get error body, but handle cases where it might not be JSON
      let errorBody: any;
      const responseText = await backendResponse.text();
      try {
        errorBody = JSON.parse(responseText);
      } catch {
        errorBody = {
          message: `Backend returned status ${backendResponse.status}`,
        };
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
        {
          message: "Backend returned invalid JSON response",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    logger.error("Error validating ticket", {}, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = {
      message: "Internal Server Error",
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? String(error) : undefined,
    };
    return NextResponse.json(errorDetails, { status: 500 });
  }
}
