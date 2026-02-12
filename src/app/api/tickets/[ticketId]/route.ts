import { NextRequest, NextResponse } from "next/server";
import { getTicketById } from "@/lib/backend-client";
import { successResponse, handleRouteError } from "@/lib/api-response";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ ticketId: string }> }
) {
    try {
        const { ticketId } = await params;
        const ticket = await getTicketById(ticketId);
        return successResponse(ticket);
    } catch (error: any) {
        return handleRouteError(error, "Failed to fetch ticket details");
    }
}
