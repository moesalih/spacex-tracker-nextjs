import { storeLaunches } from "@/lib/launches-store"
import { getLaunches } from "@/lib/spacex"
import { NextResponse } from "next/server"

function isDebug(request: Request): boolean {
  const value = new URL(request.url).searchParams.get("debug")
  if (value === null) return false
  return value === "" || value === "true" || value === "1"
}

/**
 * Scrape launch data from Wikipedia and persist the snapshot to R2.
 * Invoked by the Worker cron trigger (hourly) and available for manual runs.
 *
 * Pass `?debug=true` to skip the R2 write and return the full scrape payload.
 */
export async function GET(request: Request) {
  try {
    const debug = isDebug(request)
    const data = await getLaunches()

    if (debug) {
      return NextResponse.json({
        ok: true,
        debug: true,
        scrapedAt: new Date().toISOString(),
        counts: {
          pastLaunches: data.pastLaunches.length,
          launches: data.launches.length,
          pastStarshipLaunches: data.pastStarshipLaunches.length,
          futureStarshipLaunches: data.futureStarshipLaunches.length,
        },
        data,
      })
    }

    const stored = await storeLaunches(data)

    return NextResponse.json({
      ok: true,
      scrapedAt: stored.scrapedAt,
      counts: {
        pastLaunches: stored.pastLaunches.length,
        launches: stored.launches.length,
        pastStarshipLaunches: stored.pastStarshipLaunches.length,
        futureStarshipLaunches: stored.futureStarshipLaunches.length,
      },
    })
  } catch (error) {
    console.error("Scrape failed:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}
