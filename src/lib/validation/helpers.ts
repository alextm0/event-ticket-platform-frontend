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
  let errorMessage = error instanceof Error ? error.message : "Validation failed. Please try again.";

  // Handle network/connection errors
  if (
    errorMessage.includes("fetch") ||
    errorMessage.includes("Network") ||
    errorMessage.includes("Failed to fetch")
  ) {
    return "Connection error. Please check your internet connection and try again.";
  }

  // Handle invalid QR code format errors
  if (
    errorMessage.includes("Invalid QR code format") ||
    errorMessage.includes("missing TICKET prefix") ||
    errorMessage.includes("Invalid QR code")
  ) {
    return "Invalid QR code format. Please scan a valid ticket QR code.";
  }

  // Handle HTTP errors
  if (errorMessage.includes("HTTP 400") || errorMessage.includes("400")) {
    return "Invalid ticket. Please scan a valid ticket QR code.";
  }

  if (errorMessage.includes("HTTP 404") || errorMessage.includes("404")) {
    return "Ticket not found. Please verify the QR code is correct.";
  }

  if (errorMessage.includes("HTTP 500") || errorMessage.includes("500")) {
    return "Server error. Please try again later.";
  }

  if (errorMessage.includes("HTTP 401") || errorMessage.includes("401")) {
    return "Authentication required. Please sign in and try again.";
  }

  if (errorMessage.includes("HTTP 403") || errorMessage.includes("403")) {
    return "Access denied. You don't have permission to validate tickets for this event.";
  }

  // Handle generic error messages
  if (errorMessage.toLowerCase().includes("not found")) {
    return "Ticket not found. Please verify the QR code is correct.";
  }

  // Return a user-friendly default message if we can't parse the error
  return "Invalid ticket. Please scan a valid ticket QR code.";
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

