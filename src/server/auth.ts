import { betterAuth, BetterAuthOptions } from "better-auth";
import { admin } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db";
import { env } from "@/env.mjs";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function configureAuth(database: D1Database) {
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

  const db = await getDb(database);

  return betterAuth({
    database: drizzleAdapter(database ?? db, {
      provider: "sqlite",
    }),
    ...betterAuthConfig,
  });
}

const { env: cfEnv } = await getCloudflareContext({ async: true });

export const auth = await configureAuth(cfEnv.DATABASE);
