import "server-only";

import { stackClientConfig } from "./env";

const serverEnv = {
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY,
  backendApiUrl: process.env.BACKEND_API_URL ?? "http://localhost:8080",
} as const;

function requireServerEnv(value: string | undefined, key: string) {
  if (!value) {
    throw new Error(
      `Environment variable ${key} is not defined. Update your .env.local before starting the dev server.`,
    );
  }
  return value;
}

export const stackServerConfig = {
  ...stackClientConfig,
  secretServerKey: requireServerEnv(serverEnv.secretServerKey, "STACK_SECRET_SERVER_KEY"),
} as const;

export const serverRuntimeConfig = {
  backendApiUrl: serverEnv.backendApiUrl.replace(/\/$/, ""),
} as const;
