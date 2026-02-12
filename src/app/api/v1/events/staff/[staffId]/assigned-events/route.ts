import { NextResponse } from "next/server";
import { serverRuntimeConfig } from "@/config/server-env";
import { requireRouteAuth } from "@/lib/api-route-auth";
import { successResponse, errorResponse, handleRouteError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{
    staffId: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { staffId } = await params;

    if (!staffId) {
      return errorResponse("staffId is required", 400);
    }

    const auth = await requireRouteAuth();
    if (auth instanceof NextResponse) {
      return auth;
    }
    const { userId, authToken } = auth;

    const backendUrl = `${serverRuntimeConfig.backendApiUrl}/api/v1/events/staff/${staffId}/assigned-events`;

    let backendResponse: Response;
    try {
      backendResponse = await fetch(backendUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          "X-User-Id": userId!,
        },
      });
    } catch (error) {
      return handleRouteError(error, "Failed to connect to backend API");
    }

    if (!backendResponse.ok) {
      const responseText = await backendResponse.text();
      let errorBody: unknown;
      try {
        errorBody = JSON.parse(responseText);
      } catch {
        errorBody = { message: "Failed to fetch assigned events" };
      }

      if (backendResponse.status === 404) {
        return errorResponse("Staff member not found", 404);
      }
      if (backendResponse.status === 403) {
        return errorResponse("User is not a staff member", 403);
      }

      // Forward backend error response (may have custom structure)
      return NextResponse.json(errorBody, { status: backendResponse.status });
    }

    const responseText = await backendResponse.text();
    let data: unknown;
    try {
      data = JSON.parse(responseText);
    } catch {
      return errorResponse("Backend returned invalid JSON response", 500);
    }

    return successResponse(data, backendResponse.status);
  } catch (error) {
    return handleRouteError(error, "Error fetching assigned events");
  }
}

