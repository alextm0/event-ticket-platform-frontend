import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverRuntimeConfig } from "@/config/server-env";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{
    staffId: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { staffId } = await params;

    if (!staffId) {
      return NextResponse.json({ message: "staffId is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const authToken = cookieStore.get("authToken")?.value;

    if (!userId || !authToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const backendUrl = `${serverRuntimeConfig.backendApiUrl}/api/v1/events/staff/${staffId}/assigned-events`;

    logger.logBackendRequest("GET", backendUrl, { staffId });

    let backendResponse: Response;
    try {
      backendResponse = await fetch(backendUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
      });
    } catch (fetchError) {
      logger.error("Failed to connect to backend API", { staffId }, fetchError);
      return NextResponse.json(
        { message: "Failed to connect to backend API" },
        { status: 500 }
      );
    }

    logger.logBackendResponse(backendResponse.status, { staffId });

    if (!backendResponse.ok) {
      const responseText = await backendResponse.text();
      let errorBody: any;
      try {
        errorBody = JSON.parse(responseText);
      } catch {
        errorBody = { message: "Failed to fetch assigned events" };
      }

      logger.logBackendError(backendResponse.status, errorBody, responseText, { staffId });

      if (backendResponse.status === 404) {
        return NextResponse.json({ message: "Staff member not found" }, { status: 404 });
      }
      if (backendResponse.status === 403) {
        return NextResponse.json({ message: "User is not a staff member" }, { status: 403 });
      }

      return NextResponse.json(errorBody, { status: backendResponse.status });
    }

    const responseText = await backendResponse.text();
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      logger.error("Failed to parse backend response as JSON", { staffId, status: backendResponse.status }, parseError);
      return NextResponse.json(
        { message: "Backend returned invalid JSON response" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    logger.error("Error fetching assigned events", {}, error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

