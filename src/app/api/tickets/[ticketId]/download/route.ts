import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverRuntimeConfig } from "@/config/server-env";

interface RouteParams {
  params: Promise<{
    ticketId: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { ticketId } = await params;

  if (!ticketId) {
    return NextResponse.json({ message: "ticketId is required" }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const authToken = cookieStore.get("authToken")?.value;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const headers: Record<string, string> = {
      "X-User-Id": userId,
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(
      `${serverRuntimeConfig.backendApiUrl}/api/v1/tickets/${encodeURIComponent(ticketId)}/download`,
      {
        method: "GET",
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(30000), // 30 second timeout
      },
    );

    if (!response.ok) {
      // Try to parse error response
      const errorText = await response.text();
      let errorBody: any;
      try {
        errorBody = JSON.parse(errorText);
      } catch {
        errorBody = { message: errorText || "Failed to download ticket PDF" };
      }

      console.error(`Backend API error (${response.status}):`, {
        ticketId,
        status: response.status,
        errorBody,
        errorText: errorText.substring(0, 200), // First 200 chars for debugging
      });

      return NextResponse.json(
        { message: errorBody.message || `HTTP ${response.status}` },
        { status: response.status }
      );
    }

    // Get the PDF blob
    const pdfBlob = await response.blob();

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = `ticket-${ticketId}.pdf`;
    if (contentDisposition) {
      // Try RFC 5987 encoded filename first
      const encodedMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/i);
      if (encodedMatch) {
        filename = decodeURIComponent(encodedMatch[1]);
      } else {
        // Fall back to basic filename
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"|filename=([^;]+)/);
        if (filenameMatch) {
          filename = (filenameMatch[1] || filenameMatch[2]).trim();
        }
      }
    }

    // Return PDF as binary response
    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Next.js API route error downloading ticket PDF:", {
      ticketId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { 
        message: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
