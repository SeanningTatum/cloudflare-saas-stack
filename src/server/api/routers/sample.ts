import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/trpc";
import { z } from "zod";
import { getHelloWorld } from "../repositories/ai";

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
});
