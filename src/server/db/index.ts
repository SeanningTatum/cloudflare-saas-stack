import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

import * as schema from "./schema";

function getLocalD1DB() {
  try {
    const basePath = path.resolve(".wrangler");
    const dbFile = fs
      .readdirSync(basePath, { encoding: "utf-8", recursive: true })
      .find((f) => f.endsWith(".sqlite"));

    if (!dbFile) {
      throw new Error(`.sqlite file not found in ${basePath}`);
    }

    const url = path.resolve(basePath, dbFile);
    return url;
  } catch (err) {
    console.log(`Error finding local D1 database: ${err}`);
    return null;
  }
}

// For development, use local SQLite file
// For production/Cloudflare Pages, this will be overridden
let dbInstance: ReturnType<typeof drizzleD1> | ReturnType<typeof drizzleLibsql>;

if (process.env.NODE_ENV === "development") {
  const localDbPath = getLocalD1DB();
  if (localDbPath) {
    const client = createClient({
      url: `file:${localDbPath}`,
    });
    dbInstance = drizzleLibsql(client, { schema, logger: true });
  } else {
    // Fallback: create a temporary in-memory database
    const client = createClient({
      url: ":memory:",
    });
    dbInstance = drizzleLibsql(client, { schema, logger: true });
  }
} else {
  // This path won't be reached in development, but is needed for builds
  // In production with Cloudflare, getRequestContext will work
  const { getRequestContext } = require("@cloudflare/next-on-pages");
  try {
    const { env } = getRequestContext();
    dbInstance = drizzleD1(env.DATABASE, { schema, logger: true });
  } catch {
    // Fallback during build time
    const client = createClient({ url: ":memory:" });
    dbInstance = drizzleLibsql(client, { schema, logger: true });
  }
}

export const db = dbInstance;
