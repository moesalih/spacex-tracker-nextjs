import * as cheerio from 'cheerio'
import type { CheerioAPI } from 'cheerio'
import pastLaunches2024 from './past-launches-2024.json'

/** Cheerio selection returned by `$()` / `.find()` / `.filter()`. */
type CheerioSelection = ReturnType<CheerioAPI>

export interface Launch {
  dateText?: string
  date?: Date | null
  type?: string
  site?: string
  payload?: string
  payloadIcon?: string | null
  orbit?: string
  customer?: string
  outcome?: string
  note?: string
}

export interface LaunchesData {
  pastLaunches: Launch[]
  launches: Launch[]
  pastStarshipLaunches: Launch[]
  futureStarshipLaunches: Launch[]
}

/** Historical launches through 2024, cached from Wikipedia scrape. */
function loadPastLaunches2024(): Launch[] {
  return pastLaunches2024.map((launch) => ({
    ...launch,
    date: launch.date ? new Date(launch.date) : null,
  }))
}

export async function getLaunches(): Promise<LaunchesData> {
  const [currentFalcon, currentStarship] = await Promise.all([
    // loadPage(
    //   'https://en.wikipedia.org/wiki/List_of_Falcon_9_and_Falcon_Heavy_launches_(2010%E2%80%932019)',
    // ),
    // loadPage(
    //   'https://en.wikipedia.org/wiki/List_of_Falcon_9_and_Falcon_Heavy_launches_(2020%E2%80%932022)',
    // ),
    // loadPage(
    //   'https://en.wikipedia.org/wiki/List_of_Falcon_9_and_Falcon_Heavy_launches_(2023)',
    // ),
    // loadPage(
    //   'https://en.wikipedia.org/wiki/List_of_Falcon_9_and_Falcon_Heavy_launches_(2024)',
    // ),
    loadPage(
      'https://en.wikipedia.org/wiki/List_of_Falcon_9_and_Falcon_Heavy_launches',
    ),
    loadPage(
      'https://en.wikipedia.org/wiki/List_of_Starship_launches',
    ),
  ])

  const data: LaunchesData = {
    pastLaunches: [
      ...loadPastLaunches2024(),
      // ...getRows(y10to19, '#Launches', 'table.collapsible', parsePastRows),
      // ...getRows(y20to22, '#Launches', 'table.collapsible', parsePastRows),
      // ...getRows(y23, '#Launches', 'table.collapsible', parsePastRows),
      // ...getRows(y24, '#Launches', 'table.collapsible', parsePastRows),
      ...getRows(currentFalcon, '#Past_launches', 'table.collapsible', parsePastRows),
    ],
    launches: [
      ...getRows(currentFalcon, '#Future_launches', 'table', parseFutureRows),
    ],

    pastStarshipLaunches: [
      ...getRows(currentStarship, '#Past_launches', 'table.plainrowheaders', parsePastStarshipRows),
    ],
    futureStarshipLaunches: [
      ...getRows(currentStarship, '#Future_launches', 'table', parseFutureStarshipRows),
    ],

  }

  return data
}

const USER_AGENT =
  'SpaceXTracker/1.0 (https://github.com/moesalih/spacex-tracker-nextjs; educational launch tracker)'

async function loadPage(url: string): Promise<CheerioAPI> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
    },
  })
  const body = await response.text()
  const $ = cheerio.load(body)
  // console.log('body', body.length, $('title').text(), body.slice(0, 200))
  return $
}

type ParseRowsFn = (rows: CheerioSelection, $: CheerioAPI) => Launch[]

function getRows(
  $: CheerioAPI,
  h2Selector: string,
  tableSelector: string,
  parseFunc: ParseRowsFn,
): Launch[] {
  const launchesH2 = $(h2Selector).parent()
  const launchesTable = launchesH2.nextAll().find(tableSelector)
  const rows = launchesTable.find('tr').filter((_i, el) => {
    if ($(el).find('th').length > 2) return false // hide header
    // if ($(el).find("td").first().attr("colspan") == 6) return false // hide year rows
    return true
  })
  // console.log('rows', rows.length, h2Selector, launchesTable.attr('class'))

  return parseFunc(rows, $)
}

function parseFutureRows(rows: CheerioSelection, $: CheerioAPI): Launch[] {
  const columns = ['dateText', 'type', 'site', 'payload', 'orbit', 'customer']
  return parseRows(rows, $, columns, 1)
}

function parsePastRows(rows: CheerioSelection, $: CheerioAPI): Launch[] {
  const columns = [
    'flightNum',
    'dateText',
    'type',
    'site',
    'payload',
    'payloadMass',
    'orbit',
    'customer',
    'outcome',
  ]
  return parseRows(rows, $, columns, 2)
}

function parseFutureStarshipRows(rows: CheerioSelection, $: CheerioAPI): Launch[] {
  const columns = ['dateText', 'type', 'shipType', 'site', 'payload', 'orbit', 'customer']
  return parseRows(rows, $, columns, 2)
}

function parsePastStarshipRows(rows: CheerioSelection, $: CheerioAPI): Launch[] {
  const columns = [
    'flightNum',
    'dateText',
    'type',
    'shipType',
    'site',
    'payload',
    'payloadMass',
    'orbit',
    'customer',
    'outcome',
  ]
  return parseRows(rows, $, columns, 2)
}

function parseRows(
  rows: CheerioSelection,
  $: CheerioAPI,
  columns: string[],
  additionalTypeChildrenLength: number,
): Launch[] {
  const launches: Launch[] = []
  let launch: Launch = {}
  rows.each((_i, el) => {
    const row = $(el)
    row.find('br').replaceWith(' ')
    const children = row.children()
    // console.log(children.length)
    if (children.first().attr('rowspan')) {
      launch = {}
      launch.dateText = removeReferences(children.eq(columns.indexOf('dateText')).text())
      launch.dateText = launch.dateText.replace(/(\d\d:\d\d)/, ' $1')
      if (launch.dateText.match(/(\d\d:\d\d)/)) {
        launch.date = new Date(launch.dateText.replace('~', '@') + ' UTC')
      }
      if (launch.date == null || Number.isNaN(launch.date.getTime())) {
        launch.date = null
      }
      launch.type = removeReferences(children.eq(columns.indexOf('type')).text()).replace('♺', '♻️')
      const shipTypeIndex = columns.indexOf('shipType')
      if (shipTypeIndex >= 0) {
        const shipType = removeReferences(children.eq(shipTypeIndex).text())
        if (shipType) {
          launch.type = (launch.type ?? '') + ', Ship ' + shipType
        }
      }
      launch.site = removeReferences(children.eq(columns.indexOf('site')).text())
      launch.payload = removeReferences(children.eq(columns.indexOf('payload')).text())
      launch.payloadIcon = getPayloadIcon(launch.payload)
      launch.orbit = removeReferences(children.eq(columns.indexOf('orbit')).text())
      launch.customer = removeReferences(children.eq(columns.indexOf('customer')).text())
      const outcomeIndex = columns.indexOf('outcome')
      if (outcomeIndex >= 0) {
        launch.outcome = removeReferences(children.eq(outcomeIndex).text())
      }
    } else if (!children.first().attr('colspan') && children.length == additionalTypeChildrenLength) {
      // parse additional vehicle types. usually for falcon heavy launches
      launch.type = (launch.type ?? '') + ', ' + removeReferences(children.eq(0).text())
    } else if (children.first().attr('colspan')) {
      launch.note = removeReferences(children.eq(0).text())
      launch.payloadIcon = launch.payloadIcon || getPayloadIcon(launch.note)
      launches.push(launch)
    }
  })
  return launches
}

function getPayloadIcon(text: string): string | null {
  if (text.toLowerCase().includes('starlink')) return '🛰'
  if (text.toLowerCase().includes('gps')) return '📍'
  if (text.toLowerCase().includes('crs')) return '📦'
  if (text.toLowerCase().includes('astronaut')) return '👨‍🚀'
  if (text.toLowerCase().includes('crew')) return '👨‍🚀'
  if (text.toLowerCase().includes('lunar')) return '🌘'
  if (text.toLowerCase().includes('classified')) return '👽'
  if (text.toLowerCase().includes('tourist')) return '👨‍🚀'
  if (text.toLowerCase().includes('rideshare')) return '🚌'
  if (text.toLowerCase().includes('telescope')) return '🔭'
  return null
}

function removeReferences(string: string): string {
  return string
    .replace(/\[\d+\]/g, '')
    .replace(/\n$/g, '')
    .replace(/\n/g, ' ')
    .replace(/\u00A0/g, ' ')
}
