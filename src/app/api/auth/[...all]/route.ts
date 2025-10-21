import { getAuth } from "@/server/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Create async handlers that properly initialize auth
async function createHandler() {
  const auth = await getAuth();
  return toNextJsHandler(auth.handler);
}

export async function GET(request: Request) {
  const handlers = await createHandler();
  return handlers.GET(request);
}

export async function POST(request: Request) {
  const handlers = await createHandler();
  return handlers.POST(request);
}
