"use client";

/**
 * Client-side utility to check authentication and role
 * Reads from localStorage (set during login)
 */

export function getClientAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("authToken");
}

export function getClientUserRole(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("userRole");
}

export function isClientAuthenticated(): boolean {
  return !!getClientAuthToken();
}

export function isClientAttendee(): boolean {
  return getClientUserRole() === "attendee";
}

export function isClientStaff(): boolean {
  return getClientUserRole() === "staff";
}

export function isClientOrganizer(): boolean {
  return getClientUserRole() === "organizer";
}

