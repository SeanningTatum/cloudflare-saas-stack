import "server-only"; // <-- ensure this file cannot be imported from the client
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import { headers } from "next/headers";
import { createCallerFactory, createTRPCContext } from "@/server/trpc";
import { makeQueryClient } from "./query-client";
import { appRouter } from "@/server/api/root";

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);

// Create a server-side tRPC caller with session context
async function createContext() {
  const headersList = await headers();

  // Create a mock Request object from headers for server-side calls
  const req = new Request("http://localhost", {
    headers: headersList,
  });

  return createTRPCContext({ req });
}

const caller = createCallerFactory(appRouter)(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<
  typeof appRouter
>(caller, getQueryClient);
