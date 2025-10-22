import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/trpc";
import { z } from "zod";
import { getHelloWorld } from "../../repositories/ai";

export const sampleRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const aiResponse = await getHelloWorld(ctx);

      return {
        greeting: `hello ${input.text}`,
        aiResponse,
      };
    }),

  // Example protected procedure - requires authentication
  getSecretMessage: protectedProcedure.query(({ ctx }) => {
    return {
      message: `Hello ${
        ctx.user.name || ctx.user.email
      }! This is a secret message.`,
      userId: ctx.user.id,
    };
  }),

  // Call background task from inngest by sending an event
  callBackgroundTask: baseProcedure
    .input(
      z.object({
        taskId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.inngest.send({
        name: "test/hello.background-task",
        data: { taskId: input.taskId },
      });

      return {
        message: "Background task called",
      };
    }),
});
