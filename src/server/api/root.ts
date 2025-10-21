import { createTRPCRouter } from "@/server/trpc";
import { sampleRouter } from "./routers/sample";

export const appRouter = createTRPCRouter({
  sample: sampleRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
