import { betterAuth, BetterAuthOptions } from "better-auth";
import { admin } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db";
import { env } from "@/env.mjs";

async function configureAuth() {
  const betterAuthConfig: Omit<BetterAuthOptions, "database"> = {
    plugins: [
      admin({
        adminRoles: ["admin"],
      }),
    ],
    secret: env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "user",
        },
        banned: {
          type: "boolean",
          required: false,
        },
        banReason: {
          type: "string",
          required: false,
        },
        banExpires: {
          type: "number",
          required: false,
        },
      },
    },
  };

  if (env.IS_CLI) {
    return betterAuth({
      database: drizzleAdapter({} as D1Database, { provider: "sqlite" }),
      ...betterAuthConfig,
    });
  }

  const db = await getDb();

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    ...betterAuthConfig,
  });
}

export const auth = await configureAuth();
