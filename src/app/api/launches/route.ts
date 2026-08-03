import { NextResponse } from "next/server"
import { loadStoredLaunches } from "@/lib/launches-store"

export async function GET() {
  const data = await loadStoredLaunches()
  if (!data) {
    return NextResponse.json(
      { error: "No launches data available." },
      { status: 404 },
    )
  }
  return NextResponse.json(data)
}
