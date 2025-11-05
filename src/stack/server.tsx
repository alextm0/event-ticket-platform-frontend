import "server-only";

import { StackServerApp } from "@stackframe/stack";

import { stackServerConfig } from "@/config/server-env";

export const stackServerApp = new StackServerApp({
  projectId: stackServerConfig.projectId,
  secretServerKey: stackServerConfig.secretServerKey,
  tokenStore: "nextjs-cookie",
});
