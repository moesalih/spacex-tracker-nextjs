import { loadStoredLaunches } from "@/lib/launches-store"
import ical, { ICalAlarmType, ICalEventTransparency } from "ical-generator"
import moment from "moment-timezone"

export async function GET() {
  const data = await spacexCalendar()

  return new Response(data, {
    headers: {
      // "Content-Type": "text/plain; charset=utf-8",
      'Content-Type': 'text/calendar; charset=utf-8',
      // "Cache-Control": "public, max-age=1800",
    },
  })
}

export const spacexCalendar = async () => {
  const data = await loadStoredLaunches()
  if (!data) { throw null }
  // console.log(data)

  data.launches = data.launches.filter(l => !!l.date)

  const timezone = "UTC"
  const cal = ical({
    prodId: { company: "spacex.page", product: "SpaceX Launches" },
    name: "SpaceX Launches",
    timezone,
  })

  for (const launch of data.launches) {
    // console.log(launch)
    const event = cal.createEvent({
      start: moment.tz(launch.date, timezone),
      end: moment.tz(launch.date, timezone).add(1, "hour"),
      timezone: timezone,
      summary: "🚀 " + (launch.payloadIcon ? launch.payloadIcon + " " : "") + launch.payload + " • " + launch.customer,
      location: launch.type + " • " + launch.site + " • " + launch.orbit,
      description: launch.note,
      organizer: "SpaceX <hello@spacex.com>",
      transparency: ICalEventTransparency.TRANSPARENT,
    })
    event.createAlarm({ type: ICalAlarmType.audio, trigger: 1800 })
  }

  // return (data.launches)
  return cal.toString()
}