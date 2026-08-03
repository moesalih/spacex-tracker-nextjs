"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import type { LaunchesData } from "@/lib/spacex"
import { getChartUrl } from "./chart"

interface LaunchesResponse extends LaunchesData {
  scrapedAt?: string
}

async function fetchLaunches(): Promise<LaunchesResponse> {
  const res = await fetch("/api/launches")
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? "Failed to load launches")
  }
  return res.json()
}

export default function Home() {
  const [isPast, setIsPast] = useState(false)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["launches"],
    queryFn: fetchLaunches,
  })

  const launches = data
    ? isPast
      ? [...data.pastLaunches].reverse()
      : data.launches
    : null
  const chartUrl = launches ? getChartUrl(launches, isPast) : null

  return (
    <div className="font-sans container mx-auto max-w-5xl p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
        <div className="text-3xl font-semibold mb-4 sm:mb-0">
          SpaceX Launches 🚀
        </div>
        {data && (
          <div className="flex flex-row gap-2">
            <Button selected={!isPast} onClick={() => setIsPast(false)}>
              Upcoming
            </Button>
            <Button selected={isPast} onClick={() => setIsPast(true)}>
              Past
            </Button>
          </div>
        )}
      </div>

      {isPending && <div className="opacity-60">Loading launches…</div>}

      {isError && (
        <div>
          {error instanceof Error
            ? error.message
            : "No launches data available."}
        </div>
      )}

      {launches && (
        <div className="flex flex-col md:flex-row  items-start md:grid md:grid-cols-12 gap-4  mb-10">
          <div className="col-span-9">
            {chartUrl && (
              <div className="max-w-xl mb-10">
                <img
                  src={chartUrl}
                  className="max-w-full"
                  alt="Launch chart"
                />
              </div>
            )}

            {launches.map((l, i) => (
              <div key={i} className="mb-6">
                <div className="font-semibold">{l.dateText}</div>
                <div className="my-1">
                  {l.payloadIcon} {l.payload} • {l.customer}
                </div>
                <div className="text-sm font-semibold opacity-60 my-1">
                  {l.type} • {l.site} • {l.orbit}
                </div>
                <div className="text-sm opacity-60">{l.note}</div>
              </div>
            ))}
          </div>
          <div className="col-span-3 bg-neutral-900 rounded-md text-sm p-3">
            <div className="text-uppercase text-xs opacity-50">Source</div>
            <div className="mb-3">
              <a
                href="https://en.wikipedia.org/wiki/List_of_Falcon_9_and_Falcon_Heavy_launches#Future_launches"
                target="_blank"
              >
                Wikipedia: List of Falcon 9 and Falcon Heavy launches
              </a>
            </div>

            <div className="mb-3">
              <a
                href="https://moe-ical_subscribe.web.val.run?title=SpaceX Launches&url=https://spacex.page/calendar"
                target="_blank"
                className="mr-3"
              >
                Sync to calendar
              </a>
            </div>

            <div className="text-uppercase text-xs opacity-50">Created by</div>
            <div className="">
              <a href="https://0xMoe.com" target="_blank" className="mr-3">
                MOΞ
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const Button = ({
  selected,
  className: extraClassName,
  ...props
}: {
  selected: boolean
  className?: string
  onClick?: () => void
  children: React.ReactNode
}) => {
  const className = `
	flex flex-row justify-center items-center rounded-md px-3 py-1 text-sm font-medium cursor-pointer
	${selected ? "bg-neutral-700 text-inherit" : "text-neutral-500"}
	shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600  
	opacity-95 hover:opacity-100 disabled:opacity-50
	${extraClassName || ""}
	`

  return <button type="button" {...props} className={className} />
}
