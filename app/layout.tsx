import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "StartupShowcase - Share Your Student Innovation Ideas",
  description:
    "A platform for students to showcase startup ideas, collaborate with peers, and get visibility for their innovations.",
  icons: {
    icon: "/favicon.ico",
  },
  generator: 'StartupShowcasePortal',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Ensure proper viewport on mobile devices when metadata isn't enough */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
