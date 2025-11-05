import type { CurrentServerUser } from "@stackframe/stack";

import { serverRuntimeConfig } from "@/config/server-env";

interface CreateUserPayload {
  id: string;
  email: string;
  fullName: string;
  role: string;
  password: string;
}

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_MAX_RETRIES = 2;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createBackendUser(
  user: CurrentServerUser,
  payload: CreateUserPayload,
  options: { timeoutMs?: number; maxRetries?: number } = {},
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;

  const { accessToken } = await user.currentSession.getTokens();
  if (!accessToken) {
    throw new Error("No Stack Auth access token available for the current user.");
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
      const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
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

      if ((isAbortError || isFetchError || (error instanceof Error && /Retryable backend/.test(error.message))) && attempt < maxRetries) {
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
