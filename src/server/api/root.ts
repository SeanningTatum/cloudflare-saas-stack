import { createTRPCRouter } from "@/server/trpc";
import { sampleRouter } from "./routers/sample";
import { adminRouter } from "./routers/admin";
import { debugRouter } from "./routers/debug";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  sample: sampleRouter,
  debug: debugRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
