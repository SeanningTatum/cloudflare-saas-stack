import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as schema from "@/server/db/schema";
import { env } from "@/env.mjs";

// Lazy database getter for runtime resolution
async function getDatabase() {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.DATABASE) {
    throw new Error("DATABASE binding not found");
  }
  return drizzleD1(env.DATABASE, { schema, logger: true });
}

// Create auth instance synchronously for Better Auth CLI
const db = await getDatabase();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: env.BETTER_AUTH_SECRET,
  plugins: [admin()],
  // baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000",
});
