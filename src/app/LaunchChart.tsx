"use client"

import { useEffect, useRef, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipContentProps } from "recharts"
import type { Launch } from "@/lib/spacex"
import {
  getActiveVehicles,
  getLaunchChartData,
  VEHICLE_COLORS,
} from "./chart"

const gridLineColor = "rgba(130, 130, 130, 0.3)"
const tickStyle = { fill: "#888", fontSize: 12 }
const CHART_HEIGHT = 300

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => setWidth(el.clientWidth)
    update()

    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, width }
}

function LaunchTooltip({ active, label, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null

  const items = payload.filter(
    (item) => typeof item.value === "number" && item.value > 0,
  )
  if (items.length === 0) return null

  return (
    <div className="rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs leading-5 text-neutral-100">
      <div className="mb-0.5 font-medium">{label}</div>
      {items.map((item) => (
        <div key={String(item.dataKey)} className="flex items-center gap-1.5">
          <span
            className="inline-block size-2 shrink-0 rounded-[1px]"
            style={{ background: item.color ?? item.fill }}
          />
          <span>
            {item.name}: {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function LaunchChart({ launches }: { launches: Launch[] }) {
  const data = getLaunchChartData(launches)
  const vehicles = getActiveVehicles(data)
  const { ref, width } = useElementWidth<HTMLDivElement>()

  if (data.length === 0 || vehicles.length === 0) return null

  return (
    <div ref={ref} className="mb-10 h-72 w-full min-w-0 max-w-xl overflow-hidden">
      {width > 0 && (
        <BarChart
          width={width}
          height={CHART_HEIGHT}
          data={data}
          margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
          barCategoryGap={data.length <= 6 ? "18%" : "12%"}
        >
          <CartesianGrid stroke={gridLineColor} vertical={false} />
          <XAxis
            dataKey="year"
            tick={tickStyle}
            tickLine={false}
            axisLine={{ stroke: gridLineColor }}
            minTickGap={12}
          />
          <YAxis
            allowDecimals={false}
            tick={tickStyle}
            tickLine={false}
            axisLine={{ stroke: gridLineColor }}
            width={36}
          />
          <Tooltip
            cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
            content={LaunchTooltip}
            isAnimationActive={false}
          />
          <Legend
            position={'top'}
            offset={10}
            wrapperStyle={{ color: "#888", fontSize: 12 }}
            iconType="square"
            iconSize={10}
          />
          {vehicles.map((vehicle) => (
            <Bar
              key={vehicle}
              dataKey={vehicle}
              stackId="launches"
              fill={VEHICLE_COLORS[vehicle]}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      )}
    </div>
  )
}
