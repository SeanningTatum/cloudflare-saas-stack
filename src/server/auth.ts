import { getDb } from "@/server/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Auth } from "better-auth";

let authInstance: Auth | null = null;

export async function getAuth() {
  if (!authInstance) {
    const db = await getDb();

    const { env } = await getCloudflareContext({ async: true });

    // Base URL should be set based on the request or environment
    const baseURL =
      process.env.AUTH_URL ||
      process.env.NEXT_PUBLIC_AUTH_URL ||
      "http://localhost:3000";

    authInstance = betterAuth({
      database: drizzleAdapter(db, {
        provider: "sqlite",
      }),
      emailAndPassword: {
        enabled: true,
      },
      secret: env.BETTER_AUTH_SECRET,
      baseURL,
    });
  }
  return authInstance;
}
