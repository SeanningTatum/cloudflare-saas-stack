import { createTRPCRouter } from "@/server/trpc";
import { adminRouter } from "./routers/admin";
import { debugRouter } from "./routers/debug";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  debug: debugRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
