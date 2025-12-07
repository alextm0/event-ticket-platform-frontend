import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";
import { validateTicketWithBackend } from "@/lib/shared/ticket-validation";

interface RouteParams {
  params: Promise<{
    eventId: string;
    ticketId: string;
  }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    // Read URL params
    const { eventId, ticketId } = await params;

    // Validate required parameters
    if (!eventId || !ticketId) {
      return NextResponse.json(
        { message: "eventId and ticketId are required" },
        { status: 400 }
      );
    }

    // Read auth from cookies
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const userRole = cookieStore.get("userRole")?.value;
    const authToken = cookieStore.get("authToken")?.value;

    // Auth and role checks
    if (!userId || !authToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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

    // Call shared validation helper
    const result = await validateTicketWithBackend({
      eventId,
      ticketId,
      authToken,
      userId,
      code,
      organizerId,
    });

    // Handle result
    if (!result.success) {
      if (result.error) {
        const errorBody = result.error.body;
        // Extract user-friendly error message from backend error response
        let errorMessage = "Validation failed";
        
        if (errorBody) {
          // Check for detail field (common in error responses)
          if (errorBody.detail) {
            errorMessage = errorBody.detail;
          } else if (errorBody.message) {
            errorMessage = errorBody.message;
          } else if (errorBody.title) {
            errorMessage = errorBody.title;
          }
          
          // Handle specific invalid QR code format errors
          if (errorMessage.includes("Invalid QR code format") || errorMessage.includes("missing TICKET prefix")) {
            errorMessage = "Invalid QR code format. Please scan a valid ticket QR code.";
          }
        }
        
        return NextResponse.json(
          { 
            ...errorBody,
            message: errorMessage,
            valid: false,
          }, 
          { status: result.error.status }
        );
      }
      return NextResponse.json({ 
        message: "Validation failed",
        valid: false,
      }, { status: result.status });
    }

    // Format response according to the expected structure (route-specific)
    // Backend returns validationStatus: "VALID" or "INVALID" which indicates the actual validation result
    const validationStatus = result.data?.validationStatus;
    const isValid = validationStatus === "VALID";
    
    // Determine message based on validation status
    let message: string;
    if (validationStatus === "VALID") {
      message = result.data?.message || "Ticket validated successfully";
    } else if (validationStatus === "INVALID") {
      // Ticket was already validated or is invalid
      const ticketStatus = result.data?.ticketStatus;
      if (ticketStatus === "CHECKED_IN" || ticketStatus === "USED") {
        message = result.data?.message || "Ticket already checked in";
      } else {
        message = result.data?.message || "Ticket is invalid";
      }
    } else {
      message = result.data?.message || "Validation failed";
    }

    // Set defaults first, then overlay backend data so backend values win
    const defaults = {
      valid: isValid,
      ticketId: ticketId, // Use route ticketId as fallback
      eventId: eventId, // Keep as string (UUIDs are strings)
      status: result.data?.ticketStatus || "USED",
      message: message,
    };

    // Merge backend data over defaults so backend values take precedence
    const formattedResponse = {
      ...defaults,
      ...result.data, // Backend data overwrites defaults
      // Ensure valid, ticketId, eventId, and message are set correctly
      valid: isValid, // Use validationStatus to determine valid
      ticketId: result.data?.ticketId ?? ticketId,
      eventId: result.data?.eventId ?? eventId,
      message: message, // Use our computed message
      validationStatus: validationStatus, // Include validationStatus for reference
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

