import { NextResponse } from "next/server";
import { serverRuntimeConfig } from "@/config/server-env";
import { requireRouteAuth } from "@/lib/api-route-auth";
import { successResponse, errorResponse, handleRouteError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{
    ticketId: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { ticketId } = await params;

  if (!ticketId) {
    return errorResponse("ticketId is required", 400);
  }

  try {
    const auth = await requireRouteAuth();
    if (auth instanceof NextResponse) {
      return auth;
    }
    const { userId, authToken } = auth;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-User-Id": userId!,
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(
      `${serverRuntimeConfig.backendApiUrl}/api/v1/tickets/${ticketId}/qr-codes`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return errorResponse(errorBody || "Failed to fetch QR code", response.status);
    }

    const data = await response.json();
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error, "Error fetching QR code");
  }
}
