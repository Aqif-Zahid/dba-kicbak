import type React from "react";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Suspense } from "react";
import "../styles/globals.css";
import "stream-chat-react/dist/css/v2/index.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AuthWrapper } from "@/providers/auth-wrapper";
import { PageLoader } from "@/components/loader";
import { QueryProvider } from "@/providers/query-provider";

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
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        <AuthWrapper>
          <NuqsAdapter>
            <Suspense fallback={<PageLoader />}>
              <QueryProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem={false}
                  disableTransitionOnChange
                >
                  {children}
                </ThemeProvider>
              </QueryProvider>
            </Suspense>
          </NuqsAdapter>
        </AuthWrapper>
      </body>
    </html>
  );
}
