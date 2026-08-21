import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"
import { Providers } from "./providers"
import "./globals.css"
import { cn } from "@/lib/utils"

// const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "SpaceX Launches 🚀",
  description: "SpaceX Launches 🚀",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn("font-sans", geistSans.variable, geistMono.variable)}>
      <body
        className={`${geistSans.className} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
