/**
 * Validation Module
 * 
 * Centralized ticket validation logic with separate client and server implementations
 */

// Client-side validation (calls Next.js API route)
export { validateTicket } from "./client";

// Server-side validation (calls backend directly)
export { validateTicketWithBackend } from "./server";
export type { TicketValidationOptions, TicketValidationResult } from "./server";

// Shared validation helpers
export {
    sanitizeValidationErrorMessage,
    isTicketValid,
    isTicketAlreadyCheckedIn,
    getValidationMessage,
} from "./helpers";
export type { ValidationResponse } from "./helpers";
