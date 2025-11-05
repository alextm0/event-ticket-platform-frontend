import type { CurrentServerUser } from "@stackframe/stack";

import { serverRuntimeConfig } from "@/config/server-env";

interface CreateUserPayload {
  id: string;
  email: string;
  fullName: string;
  role: string;
  password: string;
}

export async function createBackendUser(
  user: CurrentServerUser,
  payload: CreateUserPayload,
): Promise<void> {
  const { accessToken } = await user.currentSession.getTokens();
  if (!accessToken) {
    throw new Error("No Stack Auth access token available for the current user.");
  }

  const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: payload.id,
      email: payload.email,
      name: payload.fullName,
      role: payload.role.toUpperCase(),
      password: payload.password,
    }),
  });

  if (response.ok || response.status === 409) {
    return;
  }

  const body = await response.text();
  throw new Error(
    `Failed to create backend user (${response.status} ${response.statusText}): ${body}`,
  );
}
