import type React from "react";
import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Kicbak",
  description: "Kicbak cuts out the travel middleman.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html
        lang="en"
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <body className="font-sans">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}
