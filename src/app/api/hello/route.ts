import type { NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request: NextRequest) {
  let responseText = "Hello World";

  // In the edge runtime you can use Bindings that are available in your application
  // (for more details see:
  //    - https://developers.cloudflare.com/workers/runtime-apis/bindings/
  // )
  //
  // KV Example:
  // const { env } = getCloudflareContext()
  // await env.MY_KV_NAMESPACE.put('suffix', ' from a KV store!')
  // const suffix = await env.MY_KV_NAMESPACE.get('suffix')
  // responseText += suffix
  //
  // R2 Example:
  // const { env } = getCloudflareContext()
  // await env.BUCKET.put('test.txt', 'Hello from R2!')
  // const file = await env.BUCKET.get('test.txt')
  // if (file) responseText = await file.text()

  return new Response(responseText);
}
