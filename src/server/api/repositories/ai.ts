import { TRPCContext } from "@/server/trpc";

export async function getHelloWorld(ctx: TRPCContext) {
  const { response } = await ctx.ai.run(
    "@cf/meta/llama-4-scout-17b-16e-instruct",
    {
      prompt: "What is the origin of the phrase Hello, World",
    }
  );

  return response;
}
