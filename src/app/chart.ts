export const getChartUrl = (launches, isPast) => {
  let vehicles = [
    'F9 B5',
    'Falcon Heavy',
    'F9 B4',
    'F9 FT',
    'F9 v1.1',
    'F9 v1.0',
  ]
  let colors = [
    'rgba(54, 162, 235, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(100, 100, 100, 1)',
  ]

  let getChartData = (yearLabels, launches) => {
    let getYearFromDateText = (launchDateText) => {
      for (let y of yearLabels) if (launchDateText.includes(y)) return y
    }
    let data = {
      labels: yearLabels,
      datasets: vehicles.map((v, i) => {
        const ll = launches.filter((launch) => launch.type.includes(v))
        let years = ll.map((launch) => getYearFromDateText(launch.dateText))
        // console.log(v, years)

        let counts = years.reduce((map, val) => {
          map[val] = (map[val] || 0) + 1
          return map
        }, {})
        return {
          label: v,
          data: yearLabels.map((y) => counts[y] || 0),
          backgroundColor: colors[i],
        }
      }),
    }
    return data
  }

  const currentYear = 2026
  let pastYears = []
  for (let index = 2010; index <= currentYear; index++) pastYears.push(index)

  let futureYears = []
  for (let index = currentYear; index <= currentYear + 4; index++) {
    futureYears.push(index)
  }

  const years = isPast ? pastYears : futureYears
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