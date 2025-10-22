import { getDb } from "@/server/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Auth } from "better-auth";

let authInstance: Auth | null = null;

async function createBetterAuthInstance() {
  const db = await getDb();

  const { env } = await getCloudflareContext({ async: true });

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000",
  });
}

export async function getAuth() {
  if (!authInstance) {
    authInstance = await createBetterAuthInstance();
  }

  return authInstance;
}
