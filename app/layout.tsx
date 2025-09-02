import type React from "react"
import type { Metadata } from "next"
import { Geist as Geist_Sans, Geist_Mono } from "next/font/google"
import { Suspense } from "react"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

const geistSans = Geist_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
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
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <body className="font-sans">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </body>
      </html>
    </ClerkProvider>
  )
}
