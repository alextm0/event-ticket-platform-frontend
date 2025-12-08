/**
 * Helper functions for processing ticket validation responses
 */

export interface ValidationResponse {
  valid?: boolean;
  validationStatus?: string;
  ticketStatus?: string;
  status?: string;
  message?: string;
}

/**
 * Extract and sanitize error message from validation errors
 */
export function sanitizeValidationErrorMessage(error: unknown): string {
  let errorMessage = error instanceof Error ? error.message : "Validation failed. Try again.";

  // Handle invalid QR code format errors
  if (
    errorMessage.includes("Invalid QR code format") ||
    errorMessage.includes("missing TICKET prefix")
  ) {
    return "Invalid QR code format. Please scan a valid ticket QR code.";
  }
  
  if (errorMessage.includes("HTTP 500")) {
    return "Invalid QR code. Please scan a valid ticket QR code.";
  }

  return errorMessage;
}

/**
 * Determine if a ticket is valid based on validation response
 */
export function isTicketValid(data: ValidationResponse): boolean {
  return data.valid === true || data.validationStatus === "VALID";
}

/**
 * Determine if a ticket was already checked in
 */
export function isTicketAlreadyCheckedIn(data: ValidationResponse): boolean {
  return (
    data.validationStatus === "INVALID" &&
    (data.status === "CHECKED_IN" || data.ticketStatus === "CHECKED_IN")
  );
}

/**
 * Get user-friendly validation message from response
 */
export function getValidationMessage(data: ValidationResponse): string {
  if (isTicketValid(data)) {
    return data.message || "Ticket validated successfully";
  }

  if (isTicketAlreadyCheckedIn(data)) {
    return data.message || "Ticket already checked in";
  }

  return data.message || "Ticket is invalid";
}

