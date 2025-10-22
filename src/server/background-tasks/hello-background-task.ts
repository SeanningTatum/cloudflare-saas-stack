import { inngest } from "../inngest/client";
import { z } from "zod";

const eventDataSchema = z.object({
  taskId: z.string(),
});

export const helloBackgroundTask = inngest.createFunction(
  { id: "hello-background-task" },
  { event: "test/hello.background-task" },
  async ({ event, step }) => {
    const validatedData = eventDataSchema.parse(event.data);

    await step.sleep("wait-a-moment", "5s");
    return { message: `Hello background task! Input: ${validatedData.taskId}` };
  }
);
