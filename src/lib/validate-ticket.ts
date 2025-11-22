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
  const response = await fetch(
    `/api/events/${eventId}/tickets/${ticketId}/validate`,
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
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return await response.json();
}

