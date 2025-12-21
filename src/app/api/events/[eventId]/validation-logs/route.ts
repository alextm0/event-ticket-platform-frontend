import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getValidationLogs } from "@/lib/backend-client";

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

    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    const userRole = cookieStore.get("userRole")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (userRole !== "staff") {
      return NextResponse.json(
        { error: "Only staff members can view validation logs" },
        { status: 403 }
      );
    }

    const logs = await getValidationLogs(eventId);

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error("Error fetching validation logs:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch validation logs";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

