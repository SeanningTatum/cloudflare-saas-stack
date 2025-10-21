import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/trpc";
import { z } from "zod";

export const sampleRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(({ input }) => {
      return {
        greeting: `hello ${input.text}`,
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
