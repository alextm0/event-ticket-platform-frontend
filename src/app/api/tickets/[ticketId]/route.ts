import { NextRequest, NextResponse } from "next/server";
import { getTicketById } from "@/lib/backend-client";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ ticketId: string }> }
) {
    try {
        const { ticketId } = await params;
        const ticket = await getTicketById(ticketId);
        return NextResponse.json(ticket);
    } catch (error: any) {
        console.error("Failed to fetch ticket details:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch ticket details" },
            { status: 500 }
        );
    }
}
