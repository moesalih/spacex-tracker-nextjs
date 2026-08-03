import { loadStoredLaunches } from "@/lib/launches-store"
import { NextResponse } from "next/server"

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
