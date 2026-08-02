import { NextResponse } from "next/server";
import { getLaunches } from "@/lib/spacex";

export async function GET() {
	const data = await getLaunches();
	return NextResponse.json(data);
}
