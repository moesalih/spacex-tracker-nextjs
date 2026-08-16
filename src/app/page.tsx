"use client"

import { useQuery } from "@tanstack/react-query"
import { Search, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Launch, LaunchesData } from "@/lib/spacex"
import { LaunchChart } from "./LaunchChart"

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

function matchesSearch(launch: Launch, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const fields = [
    launch.payload,
    launch.customer,
    launch.type,
    launch.site,
    launch.orbit,
    launch.note,
  ]

  return fields.some((field) => field?.toLowerCase().includes(q))
}

export default function Home() {
  const [isPast, setIsPast] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["launches"],
    queryFn: fetchLaunches,
  })

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus()
    }
  }, [isSearchOpen])

  const isSearchActive = isSearchOpen && searchQuery.trim().length > 0

  const launches = useMemo(() => {
    if (!data) return null

    if (isSearchActive) {
      const combined = [
        ...[...data.launches].reverse(),
        ...[...data.pastLaunches].reverse(),
      ]
      return combined.filter((l) => matchesSearch(l, searchQuery))
    }

    return isPast ? [...data.pastLaunches].reverse() : data.launches
  }, [data, isPast, isSearchActive, searchQuery])

  function closeSearch() {
    setIsSearchOpen(false)
    setSearchQuery("")
  }

  return (
    <div className="font-sans container mx-auto max-w-5xl p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div className="text-3xl font-semibold">
          SpaceX Launches 🚀
        </div>
        {data && (
          <div className="flex flex-row flex-wrap items-center gap-2">
            <ToggleGroup
              value={isSearchActive ? [] : [isPast ? "past" : "upcoming"]}
              onValueChange={(value) => {
                if (value.includes("past")) {
                  setIsPast(true)
                  if (isSearchActive) closeSearch()
                } else if (value.includes("upcoming")) {
                  setIsPast(false)
                  if (isSearchActive) closeSearch()
                }
              }}
              variant="outline"
              spacing={0}
            >
              <ToggleGroupItem value="upcoming">Upcoming</ToggleGroupItem>
              <ToggleGroupItem value="past">Past</ToggleGroupItem>
            </ToggleGroup>
            <Button
              variant={isSearchOpen ? "secondary" : "outline"}
              size="icon"
              onClick={() => {
                if (isSearchOpen) {
                  closeSearch()
                } else {
                  setIsSearchOpen(true)
                }
              }}
              aria-label={isSearchOpen ? "Close search" : "Open search"}
            >
              {isSearchOpen ? <X /> : <Search />}
            </Button>
            {isSearchOpen && (
              <Input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search…"
                className="w-[8rem]"
              />
            )}
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
          <div className="col-span-9 min-w-0 w-full">
            <LaunchChart launches={launches} />

            {isSearchActive && (
              <div className="text-sm opacity-60 mb-4">
                {launches.length === 0
                  ? "No launches match your search."
                  : `${launches.length} result${launches.length === 1 ? "" : "s"}`}
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
          <div className="col-span-3 bg-neutral-100 rounded-md text-sm p-3 dark:bg-neutral-900">
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
                href="/calendar/sync"
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
