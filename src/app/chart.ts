import type { Launch } from "@/lib/spacex"

export const VEHICLES = [
  "F9 B5",
  "Falcon Heavy",
  "F9 B4",
  "F9 FT",
  "F9 v1.1",
  "F9 v1.0",
  "Block 1",
  "Block 2",
  "Block 3",
  "Unknown",
] as const

export type Vehicle = (typeof VEHICLES)[number]

export const VEHICLE_COLORS: Record<Vehicle, string> = {
  "F9 B5": "rgb(54, 162, 235)",
  "Falcon Heavy": "rgb(255, 99, 132)",
  "F9 B4": "rgb(255, 206, 86)",
  "F9 FT": "rgb(75, 192, 192)",
  "F9 v1.1": "rgb(153, 102, 255)",
  "F9 v1.0": "rgb(255, 159, 64)",
  "Block 1": "rgb(255, 99, 132)",
  "Block 2": "rgb(255, 206, 86)",
  "Block 3": "rgb(54, 162, 235)",
  Unknown: "rgb(128, 128, 128, 0.5)",
}

export type LaunchChartRow = { year: number } & Record<Vehicle, number>

function getYearFromLaunch(launch: Launch): number | null {
  if (launch.dateText) {
    const match = launch.dateText.match(/\b(20\d{2}|19\d{2})\b/)
    if (match) return Number(match[1])
  }
  if (launch.date) {
    const d = launch.date instanceof Date ? launch.date : new Date(launch.date)
    if (!Number.isNaN(d.getTime())) return d.getUTCFullYear()
  }
  return null
}

function getYearsFromLaunches(launches: Launch[]): number[] {
  const found = new Set<number>()
  for (const launch of launches) {
    const year = getYearFromLaunch(launch)
    if (year != null) found.add(year)
  }
  if (found.size === 0) return []

  const sorted = [...found].sort((a, b) => a - b)
  const years: number[] = []
  for (let y = sorted[0]; y <= sorted[sorted.length - 1]; y++) {
    years.push(y)
  }
  return years
}

export function getLaunchChartData(launches: Launch[]): LaunchChartRow[] {
  const years = getYearsFromLaunches(launches)
  if (years.length === 0) return []

  const countsByVehicle = Object.fromEntries(
    VEHICLES.map((vehicle) => [vehicle, {} as Record<number, number>]),
  ) as Record<Vehicle, Record<number, number>>

  for (const launch of launches) {
    const year = getYearFromLaunch(launch)
    if (year == null) continue
    const vehicle = VEHICLES.find((v) => launch.type?.includes(v))
    if (!vehicle) continue
    countsByVehicle[vehicle][year] = (countsByVehicle[vehicle][year] || 0) + 1
  }

  return years.map((year) => {
    const row = { year } as LaunchChartRow
    for (const vehicle of VEHICLES) {
      row[vehicle] = countsByVehicle[vehicle][year] || 0
    }
    return row
  })
}

export function getActiveVehicles(data: LaunchChartRow[]): Vehicle[] {
  return VEHICLES.filter((vehicle) => data.some((row) => row[vehicle] > 0))
}
