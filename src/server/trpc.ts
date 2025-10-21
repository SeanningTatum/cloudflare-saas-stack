import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { getAuth } from "@/server/auth";

/**
 * Creates the tRPC context with better-auth session
 * @see: https://trpc.io/docs/server/context
 */
export const createTRPCContext = cache(async (opts?: { req: Request }) => {
  const auth = await getAuth();

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
  };
});

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
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
