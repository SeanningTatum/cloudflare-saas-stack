import { createTRPCRouter } from "@/server/trpc";
import { sampleRouter } from "./routers/sample";
import { adminRouter } from "./routers/admin";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  sample: sampleRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
