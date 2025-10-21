import { baseProcedure, createTRPCRouter } from "@/server/trpc";
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
});
