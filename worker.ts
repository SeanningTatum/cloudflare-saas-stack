// Custom worker wrapper to export workflows
// This file wraps the OpenNext-generated worker and adds workflow exports
// @ts-ignore `.open-next/worker.ts` is generated at build time
import { default as handler } from "./.open-next/worker.js";

export default {
  fetch: handler.fetch,
} satisfies ExportedHandler<CloudflareEnv>;

// Export workflow classes for Cloudflare Workflows
export { ExampleWorkflow } from "./src/server/workers/example.js";
