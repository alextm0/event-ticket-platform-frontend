import { redirect } from "next/navigation";

/**
 * If the error is a 403 or 401 from the backend, redirect to sign-in.
 * Otherwise rethrow the error.
 */
export function redirectIfAuthError(error: unknown, nextPath: string): never {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes("403") || msg.includes("401")) {
    redirect(`/sign-in?session_expired=1&next=${encodeURIComponent(nextPath)}`);
  }
  throw error;
}
