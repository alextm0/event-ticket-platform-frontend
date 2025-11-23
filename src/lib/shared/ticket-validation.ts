import { serverRuntimeConfig } from "@/config/server-env";
import { logger } from "@/lib/logger";

export interface TicketValidationOptions {
  eventId: string;
  ticketId: string;
  authToken: string;
  userId: string;
  code?: string; // Optional scanned code (if different from ticketId)
  organizerId?: number;
  validationMethod?: string; // Optional validation method (defaults to "SCAN")
}

export interface TicketValidationResult {
  success: boolean;
  status: number;
  data?: any;
  error?: {
    status: number;
    body: any;
    message: string;
  };
}

/**
 * Shared helper function to validate a ticket with the backend API.
 * Handles the backend fetch, error handling, and logging.
 *
 * @param options - Validation options
 * @returns Promise with validation result
 */
export async function validateTicketWithBackend(
  options: TicketValidationOptions
): Promise<TicketValidationResult> {
  const {
    eventId,
    ticketId,
    authToken,
    userId,
    code,
    organizerId,
    validationMethod = "SCAN",
  } = options;

  // Use provided code or fallback to ticketId
  const scannedCode = code || ticketId;

  // Build request body for backend
  const backendBody: any = { qrCodeId: scannedCode };
  if (organizerId) {
    backendBody.organizerId = organizerId;
  }
  if (validationMethod) {
    backendBody.validationMethod = validationMethod;
  }

  const backendUrl = `${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}/ticket-validations`;

  logger.logBackendRequest("POST", backendUrl, { eventId, ticketId });

  let backendResponse: Response;
  try {
    backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
        "X-User-Id": userId,
      },
      body: JSON.stringify(backendBody),
    });
  } catch (fetchError) {
    logger.error("Failed to connect to backend API", { eventId, ticketId }, fetchError);
    return {
      success: false,
      status: 500,
      error: {
        status: 500,
        body: { message: "Failed to connect to backend API" },
        message: fetchError instanceof Error ? fetchError.message : "Unknown fetch error",
      },
    };
  }

  logger.logBackendResponse(backendResponse.status, { eventId, ticketId });

  // Handle error responses
  if (!backendResponse.ok) {
    const responseText = await backendResponse.text();
    let errorBody: any;
    try {
      errorBody = JSON.parse(responseText);
    } catch {
      errorBody = {
        message: `Backend returned status ${backendResponse.status}`,
      };
    }

    logger.logBackendError(backendResponse.status, errorBody, responseText, { eventId, ticketId });

    return {
      success: false,
      status: backendResponse.status,
      error: {
        status: backendResponse.status,
        body: errorBody,
        message: errorBody.message || `Backend returned status ${backendResponse.status}`,
      },
    };
  }

  // Parse successful response
  const responseText = await backendResponse.text();
  let data: any;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    logger.error(
      "Failed to parse backend response as JSON",
      { eventId, ticketId, status: backendResponse.status },
      parseError
    );
    return {
      success: false,
      status: 500,
      error: {
        status: 500,
        body: { message: "Backend returned invalid JSON response" },
        message: "Backend returned invalid JSON response",
      },
    };
  }

  return {
    success: true,
    status: backendResponse.status,
    data,
  };
}

