import { createAuthClient } from "better-auth/react";
import { env } from "@/env.mjs";

export const { signIn, signUp, useSession, signOut } = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: env.NEXT_PUBLIC_AUTH_URL,
});
