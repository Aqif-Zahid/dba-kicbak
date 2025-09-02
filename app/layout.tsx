import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Suspense } from "react"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
})

export const metadata: Metadata = {
  title: "Kicbak",
  description: "Experience the power of innovation",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} antialiased`}>
        <body className="font-sans">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          {/* Analytics component removed */}
        </body>
      </html>
    </ClerkProvider>
  )
}
