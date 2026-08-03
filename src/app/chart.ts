import type { Launch } from "@/lib/spacex"

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

export const getChartUrl = (launches: Launch[]): string | null => {
  const vehicles = [
    'F9 B5',
    'Falcon Heavy',
    'F9 B4',
    'F9 FT',
    'F9 v1.1',
    'F9 v1.0',
  ]
  const colors = [
    'rgba(54, 162, 235, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(100, 100, 100, 1)',
  ]

  const getChartData = (yearLabels: number[], launches: Launch[]) => {
    return {
      labels: yearLabels,
      datasets: vehicles.map((v, i) => {
        const ll = launches.filter((launch) => launch.type?.includes(v))
        const years = ll.map((launch) => getYearFromLaunch(launch))

        const counts = years.reduce<Record<number, number>>((map, val) => {
          if (val != null) map[val] = (map[val] || 0) + 1
          return map
        }, {})
        return {
          label: v,
          data: yearLabels.map((y) => counts[y] || 0),
          backgroundColor: colors[i],
        }
      }),
    }
  }

  const years = getYearsFromLaunches(launches)
  if (years.length === 0) return null

  const chartData = getChartData(years, launches)

  const chart = {
    type: 'bar',
    data: chartData,
    options: chartOptions,
  }

  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chart))
    }`
}

const gridLineColor = 'rgba(130, 130, 130, 0.3)'

const chartOptions = {
  maintainAspectRatio: false,
  animation: false,
  legend: {
    labels: {
      boxWidth: 20,
      fontColor: '#888',
    },
  },
  scales: {
    yAxes: [
      {
        stacked: true,
        ticks: {
          beginAtZero: true,
          fontColor: '#888',
        },
        gridLines: {
          color: gridLineColor,
          zeroLineColor: gridLineColor,
        },
      },
    ],
    xAxes: [
      {
        stacked: true,
        ticks: {
          fontColor: '#888',
        },
        gridLines: {
          color: gridLineColor,
          zeroLineColor: gridLineColor,
        },
      },
    ],
  },
}