import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/trpc";

export const adminRouter = createTRPCRouter({
  getUsers: adminProcedure.query(async ({ ctx }) => {
    if (!ctx.headers) {
      throw new Error("Headers not available in context");
    }
    return ctx.auth.api.listUserAccounts({
      headers: ctx.headers,
    });
  }),
});
