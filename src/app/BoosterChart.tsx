"use client"

import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipContentProps } from "recharts"
import type { Launch } from "@/lib/spacex"
import {
  getBoosterScatterByVehicle,
  VEHICLE_COLORS,
  type BoosterScatterPoint,
} from "./chart"

const gridLineColor = "rgba(130, 130, 130, 0.3)"
const tickStyle = { fill: "#888", fontSize: 12 }
const DOT_RADIUS = 2

function SmallDot({
  cx,
  cy,
  fill,
}: {
  cx?: number
  cy?: number
  fill?: string
}) {
  if (cx == null || cy == null) return null
  return <circle cx={cx} cy={cy} r={DOT_RADIUS} fill={fill} />
}

function formatYearTick(value: number | string) {
  const d = new Date(Number(value))
  if (Number.isNaN(d.getTime())) return ""
  return String(d.getUTCFullYear())
}

function formatBoosterTick(value: number | string) {
  return `B${value}`
}

function BoosterTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null

  const point = payload[0]?.payload as BoosterScatterPoint | undefined
  if (!point) return null

  return (
    <div className="rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs leading-5 text-neutral-100">
      <div className="mb-0.5 font-medium">
        {point.dateText ?? formatYearTick(point.x)}
      </div>
      <div>Booster {point.y}</div>
      {point.mission && <div>{point.mission}</div>}
      {point.type && <div className="opacity-70">{point.type}</div>}
    </div>
  )
}

function getPoints(
  pointsByVehicle: Partial<Record<string, BoosterScatterPoint[]>>,
): BoosterScatterPoint[] {
  return Object.values(pointsByVehicle).flatMap((points) => points ?? [])
}

function getYAxis(points: BoosterScatterPoint[]): {
  domain: [number, number]
  ticks: number[]
} {
  const min = 1040
  const ys = points.map((point) => point.y).filter((y) => y >= min)
  if (ys.length === 0) return { domain: [min, min + 10], ticks: [min] }

  const max = Math.max(...ys)
  const domainMax = Math.ceil(max / 10) * 10
  const ticks: number[] = []
  for (let y = min; y <= domainMax; y += 10) {
    ticks.push(y)
  }

  return { domain: [min, domainMax], ticks }
}

function getYearAxis(points: BoosterScatterPoint[]): {
  domain: [number, number]
  ticks: number[]
} {
  if (points.length === 0) {
    return { domain: [0, 1], ticks: [] }
  }

  const xs = points.map((point) => point.x)
  const minYear = new Date(Math.min(...xs)).getUTCFullYear()
  const maxYear = new Date(Math.max(...xs)).getUTCFullYear()

  const ticks: number[] = []
  for (let year = minYear; year <= maxYear; year++) {
    ticks.push(Date.UTC(year, 0, 1))
  }

  return {
    domain: [Date.UTC(minYear, 0, 1), Date.UTC(maxYear + 1, 0, 1)],
    ticks,
  }
}

export function BoosterChart({ launches }: { launches: Launch[] }) {
  const { vehicles, pointsByVehicle } = getBoosterScatterByVehicle(launches)

  if (vehicles.length === 0) return null

  const points = getPoints(pointsByVehicle)
  const { domain: yDomain, ticks: boosterTicks } = getYAxis(points)
  const visiblePoints = points.filter(
    (point) => point.y >= yDomain[0] && point.y <= yDomain[1],
  )
  const { domain: xDomain, ticks: yearTicks } = getYearAxis(visiblePoints)
  const visibleVehicles = vehicles.filter((vehicle) =>
    (pointsByVehicle[vehicle] ?? []).some(
      (point) => point.y >= yDomain[0] && point.y <= yDomain[1],
    ),
  )

  return (
    <div className="mb-10 w-full min-w-0">
      <div className="mb-2 text-sm font-medium opacity-60">
        Launches by booster
      </div>
      <div className="aspect-video w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
            <CartesianGrid stroke={gridLineColor} syncWithTicks />
            <XAxis
              type="number"
              dataKey="x"
              name="Date"
              domain={xDomain}
              ticks={yearTicks}
              interval="equidistantPreserveStart"
              minTickGap={28}
              tick={tickStyle}
              tickLine={false}
              axisLine={{ stroke: gridLineColor }}
              tickFormatter={formatYearTick}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Booster"
              domain={yDomain}
              ticks={boosterTicks}
              interval={0}
              allowDataOverflow
              allowDecimals={false}
              tick={tickStyle}
              tickLine={false}
              axisLine={{ stroke: gridLineColor }}
              tickFormatter={formatBoosterTick}
              width={48}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={BoosterTooltip}
              isAnimationActive={false}
            />
            <Legend
              position={"top"}
              offset={10}
              wrapperStyle={{ color: "#888", fontSize: 12 }}
              iconType="circle"
              iconSize={10}
            />
            {visibleVehicles.map((vehicle) => (
              <Scatter
                key={vehicle}
                name={vehicle}
                data={pointsByVehicle[vehicle]}
                fill={VEHICLE_COLORS[vehicle]}
                shape={SmallDot}
                isAnimationActive={false}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
