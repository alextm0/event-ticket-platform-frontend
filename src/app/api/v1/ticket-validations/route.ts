import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverRuntimeConfig } from "@/config/server-env";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const userRole = cookieStore.get("userRole")?.value;
    const authToken = cookieStore.get("authToken")?.value;

    if (!userId || !authToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only staff can validate tickets
    if (userRole !== "staff") {
      return NextResponse.json({ message: "Unauthorized: Staff role required" }, { status: 403 });
    }

    const { ticketId, eventId } = await request.json();
    if (!ticketId || !eventId) {
      return NextResponse.json({ message: "ticketId and eventId are required" }, { status: 400 });
    }

    const backendUrl = `${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}/ticket-validations`;
    console.log(`Calling backend API: ${backendUrl}`);
    
    // Build request body - backend might expect validationMethod field
    const requestBody = {
      qrCodeId: ticketId,
      validationMethod: "SCAN", // Add validation method for backend
    };
    console.log(`Request body:`, requestBody);

    let backendResponse: Response;
    try {
      backendResponse = await fetch(backendUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify(requestBody),
      });
    } catch (fetchError) {
      console.error("Failed to connect to backend:", fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      return NextResponse.json(
        {
          message: "Failed to connect to backend API",
          error: errorMessage,
          backendUrl: process.env.NODE_ENV === "development" ? backendUrl : undefined,
        },
        { status: 500 }
      );
    }

    // Log backend response status
    console.log(`Backend response status: ${backendResponse.status}`);

    if (!backendResponse.ok) {
      // Try to get error body, but handle cases where it might not be JSON
      let errorBody: any;
      const responseText = await backendResponse.text();
      try {
        errorBody = JSON.parse(responseText);
      } catch {
        errorBody = {
          message: `Backend returned status ${backendResponse.status}`,
          responseText: responseText.substring(0, 500), // Limit length
        };
      }
      
      console.error(`Backend error (${backendResponse.status}):`, errorBody);
      console.error(`Backend response text:`, responseText.substring(0, 500));
      
      return NextResponse.json(errorBody, { status: backendResponse.status });
    }

    const responseText = await backendResponse.text();
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse backend response as JSON:", responseText.substring(0, 500));
      return NextResponse.json(
        {
          message: "Backend returned invalid JSON response",
          responseText: responseText.substring(0, 500),
        },
        { status: 500 }
      );
    }

    console.log("Backend validation successful:", data);
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error("Error validating ticket:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = {
      message: "Internal Server Error",
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? String(error) : undefined,
    };
    return NextResponse.json(errorDetails, { status: 500 });
  }
}
