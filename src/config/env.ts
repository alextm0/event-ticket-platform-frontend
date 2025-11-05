const clientEnv = {
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
} as const;

function requireEnv(value: string | undefined, key: string) {
  if (!value) {
    throw new Error(
      `Environment variable ${key} is not defined. Add it to your .env.local before starting the dev server.`,
    );
  }
  return value;
}

export const stackClientConfig = {
  projectId: requireEnv(clientEnv.projectId, "NEXT_PUBLIC_STACK_PROJECT_ID"),
  publishableClientKey: requireEnv(
    clientEnv.publishableClientKey,
    "NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY",
  ),
} as const;
