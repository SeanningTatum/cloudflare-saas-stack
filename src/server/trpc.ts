import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { auth } from "@/server/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "./db";
import { inngest } from "./inngest/client";

/**
 * Creates the tRPC context with better-auth session
 * @see: https://trpc.io/docs/server/context
 */
export const createTRPCContext = cache(async (opts?: { req: Request }) => {
  const db = await getDb();
  const { env } = await getCloudflareContext({ async: true });

  let session = null;
  let user = null;

  if (opts?.req) {
    try {
      // Extract session from better-auth using the request
      const sessionData = await auth.api.getSession({
        headers: opts.req.headers,
      });
      if (sessionData) {
        session = sessionData.session;
        user = sessionData.user;
      }
    } catch (error) {
      // Session doesn't exist or is invalid
      session = null;
      user = null;
    }
  }

  return {
    session,
    user,
    auth,
    ai: env.AI,
    db,
    inngest,
  };
});

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

/**
 * Protected procedure that requires authentication
 * Throws UNAUTHORIZED error if user is not authenticated
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      // Infers the `session` and `user` as non-nullable
      session: ctx.session,
      user: ctx.user,
    },
  });
});
