"use client"

export default function Home() {

  const title = 'SpaceX Launches'
  const calUrl = 'https://spacex.page/calendar'

  return (
    <div className="flex flex-col gap-3 items-center justify-center h-screen p-10">
      <div className="flex flex-col items-center justify-center bg-neutral-500/10 rounded-lg p-4 gap-1 mb-4">
        <div className="text-lg font-semibold">{title}</div>
        <code className="text-lg ">{calUrl}</code>
      </div>

      <div className="font-semibold my-4">Sync to your calendar:</div>
      <div className="text-sm xmy-2">
        iOS: Settings → Password & Accounts → Add Account → Other → Add Subscribed Calendar
      </div>
      <div className="text-sm xmy-2">MacOS: Calendar App → File → Add Calendar Subscription...</div>
      <div className="text-sm xmy-2">Google Calendar: Settings → Add Calendar → From URL</div>
    </div>
  )
}
