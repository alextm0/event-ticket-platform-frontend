import { NextRequest, NextResponse } from "next/server";
import { getValidationLogs } from "@/lib/backend-client";
import { requireRouteAuth } from "@/lib/api-route-auth";
import { successResponse, errorResponse, handleRouteError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{
    eventId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    // Check authentication (staff only)
    const auth = await requireRouteAuth("staff");
    if (auth instanceof NextResponse) {
      return auth;
    }

    const logs = await getValidationLogs(eventId);

    return successResponse(logs);
  } catch (error) {
    return handleRouteError(error, "Error fetching validation logs");
  }
}

