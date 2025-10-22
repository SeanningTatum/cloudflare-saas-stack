import { serve } from "inngest/next";
import { inngest } from "@/server/inngest/client";
import { helloBackgroundTask } from "@/server/background-tasks/hello-background-task";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloBackgroundTask],
});
