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
        return NextResponse.json(result.error.body, { status: result.error.status });
      }
      return NextResponse.json({ message: "Validation failed" }, { status: result.status });
    }

    // Format response according to the expected structure (route-specific)
    // Set defaults first, then overlay backend data so backend values win
    const defaults = {
      valid: false, // Default to false for safety - backend must explicitly set to true
      ticketId: ticketId, // Use route ticketId as fallback
      eventId: eventId, // Keep as string (UUIDs are strings)
      status: "USED",
      message: "Ticket validated successfully",
    };

    // Merge backend data over defaults so backend values take precedence
    const formattedResponse = {
      ...defaults,
      ...result.data, // Backend data overwrites defaults
      // Ensure ticketId and eventId are set correctly (use backend value if present, otherwise defaults)
      ticketId: result.data?.ticketId ?? ticketId,
      eventId: result.data?.eventId ?? eventId,
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

