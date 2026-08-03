import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { LaunchesData } from "@/lib/spacex";

/** R2 object key for the latest scraped launches snapshot. */
export const LAUNCHES_OBJECT_KEY = "launches.json";

export interface StoredLaunchesData extends LaunchesData {
	scrapedAt: string;
}

/** Persist launches data to R2 as JSON. */
export async function storeLaunches(data: LaunchesData): Promise<StoredLaunchesData> {
	const { env } = getCloudflareContext();
	const payload: StoredLaunchesData = {
		...data,
		scrapedAt: new Date().toISOString(),
	};

	await env.LAUNCHES_BUCKET.put(LAUNCHES_OBJECT_KEY, JSON.stringify(payload), {
		httpMetadata: {
			contentType: "application/json",
		},
	});

	return payload;
}

/** Read the latest launches snapshot from R2, or null if missing. */
export async function loadStoredLaunches(): Promise<StoredLaunchesData | null> {
	const { env } = getCloudflareContext();
	const object = await env.LAUNCHES_BUCKET.get(LAUNCHES_OBJECT_KEY);
	if (!object) return null;
	return object.json<StoredLaunchesData>();
}
