import {
  getAuthToken,
  createAuthHeaders,
  getBackendUrl,
} from "./http";

export { getCurrentUserId } from "./http";
import type { CreateUserPayload, UserProfile } from "@/types";

export type { CreateUserPayload, UserProfile };

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_MAX_RETRIES = 2;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createBackendUser(
  payload: CreateUserPayload,
  options: { timeoutMs?: number; maxRetries?: number } = {},
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;

  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token available.");
  }

  const requestBody = JSON.stringify({
    id: payload.id,
    email: payload.email,
    name: payload.fullName,
    role: payload.role.toUpperCase(),
    password: payload.password,
  });

  let attempt = 0;
  let delayMs = 500;
  let lastError: unknown = null;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(getBackendUrl("/api/v1/users"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok || response.status === 409) {
        return;
      }

      if (response.status >= 500 && response.status < 600 && attempt < maxRetries) {
        lastError = new Error(`Retryable backend error: ${response.status}`);
      } else {
        const body = await response.text();
        throw new Error(
          `Failed to create backend user (${response.status} ${response.statusText}): ${body}`,
        );
      }
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;

      const isAbortError = error instanceof DOMException && error.name === "AbortError";
      const isFetchError = error instanceof TypeError;

      if (
        (isAbortError ||
          isFetchError ||
          (error instanceof Error && /Retryable backend/.test(error.message))) &&
        attempt < maxRetries
      ) {
        await delay(delayMs);
        delayMs *= 2;
        attempt += 1;
        continue;
      }

      throw error;
    }

    attempt += 1;
    if (attempt <= maxRetries) {
      await delay(delayMs);
      delayMs *= 2;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error("Failed to create backend user due to repeated network errors.");
}

export async function getUserById(userId: string): Promise<UserProfile> {
  const headers = await createAuthHeaders();
  const response = await fetch(getBackendUrl(`/api/v1/users/${userId}`), {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch user (${response.status}): ${body}`);
  }

  return response.json();
}
