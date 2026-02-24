import { NextResponse } from "next/server";

/**
 * Create a success response with optional status code.
 */
export function successResponse(data: unknown, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Create an error response with consistent format.
 * All API routes should use { error: "..." } for errors.
 */
export function errorResponse(message: string, status: number = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Handle route errors: log and return standardized 500 error response.
 * Detailed error information is logged server-side but not exposed to clients.
 */
export function handleRouteError(error: unknown, context?: string): NextResponse {
  const contextMsg = context ? `${context}: ` : "";
  console.error(`${contextMsg}`, error);

  // Always return a generic message to prevent leaking sensitive details
  return errorResponse("Internal server error", 500);
}
