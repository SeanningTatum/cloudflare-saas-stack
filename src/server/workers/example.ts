import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";
import { getDb } from "@/server/db";
import * as adminRepository from "@/server/repositories/admin";

export interface ExampleWorkflowRequestPayload {
  email: string;
  metadata: Record<string, string>;
}
// Note:
// Unfortunately with the current version of the Cloudflare Workers SDK.
// We can only test with `bun run preview` since that is the only time
// wrangler is actually running the workflow.
// By default the dev command still uses next.js dev server.

/**
 * Example Cloudflare Workflow
 * This demonstrates how to use Cloudflare Workflows with full access to env bindings
 *
 * Available env bindings:
 * - this.env.DATABASE (D1)
 * - this.env.BUCKET (R2)
 * - this.env.AI (AI inference)
 * - this.env.EXAMPLE_WORKFLOW (self-reference to workflow)
 */
export class ExampleWorkflow extends WorkflowEntrypoint<
  CloudflareEnv,
  ExampleWorkflowRequestPayload
> {
  async run(
    event: WorkflowEvent<ExampleWorkflowRequestPayload>,
    step: WorkflowStep
  ) {
    console.log("Workflow started", event);

    // Example: Sleep for a duration
    await step.sleep("sleep for a bit", "1 minute");

    // Example: Access D1 database via Cloudflare context
    // Note: In workflows, env bindings are accessed via this.env directly
    const db = await getDb(this.env.DATABASE);
    const users = await adminRepository.getUsers(db, {
      page: 0,
      limit: 10,
    });

    // Example: Query database (replace with actual user ID)
    // const user = await adminRepository.getUser(db, {
    //   userId: "some-user-id",
    // });

    // Example: Access R2 bucket
    // const file = await this.env.BUCKET.get('some-file-key');

    // Example: Access AI
    // const aiResponse = await this.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
    //   prompt: event.payload.email
    // });

    console.log("Workflow finished", event.payload);

    return {
      success: true,
      message: "Workflow finished successfully",
      email: event.payload.email,
      metadata: event.payload.metadata,
      users,
    };
  }
}
