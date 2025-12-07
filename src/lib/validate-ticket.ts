/**
 * Client-side helper function to validate a ticket
 * 
 * @param eventId - The event ID
 * @param ticketId - The ticket ID (or scanned code if code is not provided)
 * @param options - Optional parameters
 * @returns Promise with validation result
 */
export async function validateTicket(
  eventId: string,
  ticketId: string,
  options?: {
    code?: string; // Optional scanned code (if different from ticketId)
    organizerId?: number; // Optional organizer ID
  }
): Promise<{
  valid: boolean;
  ticketId: string;
  eventId: number | string;
  status: string;
  message: string;
}> {
  const body: any = {};
  
  if (options?.code) {
    body.code = options.code;
  }
  
  if (options?.organizerId) {
    body.organizerId = options.organizerId;
  }

  // Authorization is handled automatically via cookies on the server
  // URL-encode path parameters to handle special characters in scanned data
  const encodedEventId = encodeURIComponent(eventId);
  const encodedTicketId = encodeURIComponent(ticketId);
  
  const response = await fetch(
    `/api/events/${encodedEventId}/tickets/${encodedTicketId}/validate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "Validation failed",
    }));
    
    // Extract user-friendly error message
    let errorMessage = errorData.message || `HTTP ${response.status}`;
    
    // Check for detail field (common in error responses)
    if (errorData.detail) {
      errorMessage = errorData.detail;
    } else if (errorData.title && !errorData.message) {
      errorMessage = errorData.title;
    }
    
    // Handle specific invalid QR code format errors
    if (errorMessage.includes("Invalid QR code format") || errorMessage.includes("missing TICKET prefix")) {
      errorMessage = "Invalid QR code format. Please scan a valid ticket QR code.";
    }
    
    throw new Error(errorMessage);
  }

  return await response.json();
}




