import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { auth } from "@/server/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "./db";
import type { User } from "better-auth";
import type { ExampleWorkflowRequestPayload } from "./workers/example";

// Extended user type that includes our custom fields

/**
 * Creates the tRPC context with better-auth session
 * @see: https://trpc.io/docs/server/context
 */
export const createTRPCContext = cache(async (opts?: { req: Request }) => {
  const { env } = await getCloudflareContext({ async: true });
  const db = await getDb(env.DATABASE);

  let session = null;
  let currentUser: User | null = null;
  let headers: HeadersInit | undefined = undefined;

  if (opts?.req) {
    headers = opts.req.headers;
    try {
      // Extract session from better-auth using the request
      const authSession = await auth.api.getSession({
        headers: opts.req.headers,
      });

      if (authSession?.user && authSession?.session) {
        session = authSession.session;
        // We can be sure that the cast is safe because of the plugin
        // and schema in auth.ts and schema.ts
        currentUser = authSession.user as unknown as User;
      }
    } catch (error) {
      // Session doesn't exist or is invalid
      session = null;
      currentUser = null;
    }
  }

  return {
    auth,
    ai: env.AI,
    db,
    session,
    headers,
    user: currentUser,
    workers: {
      exampleWorkflow:
        env.EXAMPLE_WORKFLOW as Workflow<ExampleWorkflowRequestPayload>,
    },
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

/**
 * Admin procedure that requires authentication AND admin role
 * Throws UNAUTHORIZED error if user is not authenticated or not an admin
 */
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must be an admin to access this resource",
    });
  }

  return next({
    ctx: {
      // Infers the `session` and `user` as non-nullable with admin role
      session: ctx.session,
      user: ctx.user,
    },
  });
});
