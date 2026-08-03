// @ts-expect-error `.open-next/worker.js` is generated at build time
import { default as handler } from "./.open-next/worker.js"

/**
 * Custom Worker entry: reuses OpenNext's fetch handler and adds a
 * scheduled handler so Cloudflare cron can hit the scrape API route.
 * @see https://opennext.js.org/cloudflare/howtos/custom-worker
 */
export default {
  fetch: handler.fetch,

  async scheduled(
    _controller: ScheduledController,
    env: CloudflareEnv,
    ctx: ExecutionContext,
  ) {
    const request = new Request("http://dummy.cloudflare/api/scrape", {
      method: "POST",
    })
    const response = await handler.fetch(request, env, ctx)
    const body = await response.text()
    if (!response.ok) {
      console.error("Scheduled scrape failed:", response.status, body)
      throw new Error(`Scrape failed with status ${response.status}`)
    }
    console.log("Scheduled scrape succeeded:", body)
  },
} satisfies ExportedHandler<CloudflareEnv>
