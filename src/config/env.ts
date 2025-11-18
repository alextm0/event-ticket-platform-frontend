// Stack Auth configuration removed
// This file is no longer needed but kept for compatibility
// If you need to re-add Stack Auth, restore the original implementation

export const stackClientConfig = {
  projectId: "",
  publishableClientKey: "",
} as const;

// Backend API URL for client-side use
export const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8080";
