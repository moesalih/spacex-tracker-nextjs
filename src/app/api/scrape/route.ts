import { NextResponse } from "next/server";
import { storeLaunches } from "@/lib/launches-store";
import { getLaunches } from "@/lib/spacex";

/**
 * Scrape launch data from Wikipedia and persist the snapshot to R2.
 * Invoked by the Worker cron trigger (hourly) and available for manual runs.
 */
export async function GET() {
	try {
		const data = await getLaunches();
		const stored = await storeLaunches(data);

		return NextResponse.json({
			ok: true,
			scrapedAt: stored.scrapedAt,
			counts: {
				pastLaunches: stored.pastLaunches.length,
				launches: stored.launches.length,
			},
		});
	} catch (error) {
		console.error("Scrape failed:", error);
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ ok: false, error: message }, { status: 500 });
	}
}

export async function POST() {
	return GET();
}
