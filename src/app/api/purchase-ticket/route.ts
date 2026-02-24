import { buyTicket } from "@/lib/backend-client";
import { NextRequest, NextResponse } from "next/server";
import { requireRouteAuth } from "@/lib/api-route-auth";
import { successResponse, errorResponse, handleRouteError } from "@/lib/api-response";

interface PurchaseTicketRequest {
  eventId: string;
  ticketTypeId: string;
  quantity?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication (attendee only)
    const auth = await requireRouteAuth("attendee");
    if (auth instanceof NextResponse) {
      return auth;
    }

    const body: PurchaseTicketRequest = await request.json();
    const { eventId, ticketTypeId, quantity = 1 } = body;

    if (!eventId || !ticketTypeId) {
      return errorResponse("eventId and ticketTypeId are required", 400);
    }

    const result = await buyTicket(eventId, ticketTypeId, quantity);

    return successResponse(result, 201);
  } catch (error) {
    return handleRouteError(error, "Error purchasing ticket");
  }
}
