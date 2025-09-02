import type React from "react"
import type { Metadata } from "next"
import { GeistSans, GeistMono } from "geist/font"
import { Suspense } from "react"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

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
      <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <body className="font-sans">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </body>
      </html>
    </ClerkProvider>
  )
}
