import { cookies } from "next/headers";
import { serverRuntimeConfig } from "@/config/server-env";

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_MAX_RETRIES = 2;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("authToken")?.value ?? null;
}

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value ?? null;
}

export interface CreateAuthHeadersOptions {
  /** Override userId; if not set, reads from cookies */
  userId?: string | null;
  /** If true (default), throws when token is missing */
  requireToken?: boolean;
}

export async function createAuthHeaders(
  options: CreateAuthHeadersOptions = {},
): Promise<Record<string, string>> {
  const token = await getAuthToken();
  if (options.requireToken !== false && !token) {
    throw new Error("No authentication token available.");
  }

  const userId = options.userId ?? (await getCurrentUserId());
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (userId) {
    headers["X-User-Id"] = userId;
  }

  return headers;
}

/**
 * Extract array from plain array, Spring Page { content: [...] }, or { data: [...] }
 */
export function unwrapPageResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const obj = data as Record<string, unknown> | null | undefined;
  if (obj && Array.isArray(obj.content)) return obj.content as T[];
  if (obj && Array.isArray(obj.data)) return obj.data as T[];
  throw new Error("Response does not contain an array.");
}

export interface ApiFetchOptions extends RequestInit {
  retry?: { maxRetries?: number; timeoutMs?: number };
}

/**
 * Fetch with auth headers. Optionally retries on 5xx/network errors.
 * Caller is responsible for checking response.ok and handling status codes.
 */
export async function apiFetch(
  url: string | URL,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const { retry: retryOpt, ...init } = options;
  const maxRetries = retryOpt?.maxRetries ?? 0;
  const timeoutMs = retryOpt?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const headers = await createAuthHeaders({ requireToken: true });
  const mergedInit: RequestInit = {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string>) },
    cache: init.cache ?? "no-store",
  };

  let lastError: unknown = null;
  let delayMs = 500;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url.toString(), {
        ...mergedInit,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) return response;
      if (response.status >= 500 && response.status < 600 && attempt < maxRetries) {
        lastError = new Error(`Retryable backend error: ${response.status}`);
      } else {
        const body = await response.text();
        throw new Error(
          `Request failed (${response.status} ${response.statusText}): ${body}`,
        );
      }
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;

      const isRetryable =
        error instanceof DOMException && error.name === "AbortError" ||
        error instanceof TypeError ||
        (error instanceof Error && /Retryable backend/.test(error.message));

      if (!isRetryable || attempt >= maxRetries) throw error;
    }

    await delay(delayMs);
    delayMs *= 2;
  }

  if (lastError instanceof Error) throw lastError;
  throw new Error("Request failed due to repeated network errors.");
}

export function getBackendUrl(path: string): string {
  const base = serverRuntimeConfig.backendApiUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
