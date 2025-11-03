import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

// Export a function that returns the db instance
// This allows us to dynamically get the database based on the environment
export async function getDb(database: D1Database) {
  try {
    return drizzleD1(database, { schema, logger: true });
  } catch (err) {
    console.error("Failed to get Cloudflare context:", err);
    throw new Error(
      "Database not available - make sure you're running in a Cloudflare Worker context"
    );
  }
}
