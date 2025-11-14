import type { CurrentServerUser } from "@stackframe/stack";

import { serverRuntimeConfig } from "@/config/server-env";
import { EventPayload, EventResponse } from "@/types";

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
      const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/users`, {
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

export async function getEvents(
  user: CurrentServerUser,
  options: { timeoutMs?: number; maxRetries?: number, useMockData?: boolean } = {},
): Promise<EventResponse[]> {

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;

  const { accessToken } = await user.currentSession.getTokens();
  if (!accessToken) {
    throw new Error("No Stack Auth access token available for the current user.");
  }

  let attempt = 0;
  let delayMs = 500;
  let lastError: unknown = null;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/events`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        const page = await response.json();
        return page.content;
      }

      if (response.status >= 500 && response.status < 600 && attempt < maxRetries) {
        lastError = new Error(`Retryable backend error: ${response.status}`);
      } else {
        const body = await response.text();
        throw new Error(
          `Failed to fetch events (${response.status} ${response.statusText}): ${body}`,
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
  throw new Error("Failed to fetch events due to repeated network errors.");
}

export async function createEvent(
  user: CurrentServerUser,
  payload: EventPayload,
  options: { timeoutMs?: number; maxRetries?: number } = {},
): Promise<EventResponse> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;

  const { accessToken } = await user.currentSession.getTokens();
  if (!accessToken) {
    throw new Error("No Stack Auth access token available for the current user.");
  }

  const userId = user.id;

  const requestBody = JSON.stringify(payload);

  let attempt = 0;
  let delayMs = 500;
  let lastError: unknown = null;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        return await response.json();
      }

      if (response.status >= 500 && response.status < 600 && attempt < maxRetries) {
        lastError = new Error(`Retryable backend error: ${response.status}`);
      } else {
        const body = await response.text();
        throw new Error(
          `Failed to create event (${response.status} ${response.statusText}): ${body}`,
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
  throw new Error("Failed to create event due to repeated network errors.");
}

export async function updateEvent(
  user: CurrentServerUser,
  eventId: string,
  payload: EventPayload,
  options: { timeoutMs?: number; maxRetries?: number } = {},
): Promise<EventResponse> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;

  const { accessToken } = await user.currentSession.getTokens();
  if (!accessToken) {
    throw new Error("No Stack Auth access token available for the current user.");
  }

  const requestBody = JSON.stringify(payload);

  let attempt = 0;
  let delayMs = 500;
  let lastError: unknown = null;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        return await response.json();
      }

      if (response.status >= 500 && response.status < 600 && attempt < maxRetries) {
        lastError = new Error(`Retryable backend error: ${response.status}`);
      } else {
        const body = await response.text();
        throw new Error(
          `Failed to update event (${response.status} ${response.statusText}): ${body}`,
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
  throw new Error("Failed to update event due to repeated network errors.");
}

export const backendClient = {
  createBackendUser,
  getEvents,
  createEvent,
  updateEvent,
};

