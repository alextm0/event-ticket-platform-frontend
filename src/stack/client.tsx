import { StackClientApp } from "@stackframe/stack";

import { stackClientConfig } from "@/config/env";

export const stackClientApp = new StackClientApp({
  projectId: stackClientConfig.projectId,
  publishableClientKey: stackClientConfig.publishableClientKey,
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/sign-in",
    signUp: "/sign-up",
    afterSignUp: "/onboarding",
    afterSignIn: "/",
  },
});
