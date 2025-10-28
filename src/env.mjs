import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    BETTER_AUTH_SECRET: z.string(),
    INNGEST_EVENT_KEY:
      process.env.NODE_ENV === "development"
        ? z.string().optional().nullable()
        : z.string(),
    INNGEST_SIGNING_KEY:
      process.env.NODE_ENV === "development"
        ? z.string().optional().nullable()
        : z.string(),
    AUTH_GOOGLE_ID: z.string().optional().nullable(),
    AUTH_GOOGLE_SECRET: z.string().optional().nullable(),
    IS_CLI: z
      .string()
      .optional()
      .transform((val) => (val ? val === "true" : false)),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {},
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
    IS_CLI: process.env.IS_CLI,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === "production",
});
