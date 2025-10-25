import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, useSession, signOut } = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  // baseURL is not needed when using the same domain
});
