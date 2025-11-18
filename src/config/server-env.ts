import "server-only";

const serverEnv = {
  backendApiUrl: process.env.BACKEND_API_URL ?? "http://localhost:8080",
} as const;

export const serverRuntimeConfig = {
  backendApiUrl: serverEnv.backendApiUrl.replace(/\/$/, ""),
} as const;
