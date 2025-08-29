// middleware.ts (project root)

import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Run Clerk first, then your Supabase session updater.
// Return the response from updateSession if it sets cookies, else continue.
export default clerkMiddleware(async (_auth, req: NextRequest) => {
  const res = await updateSession(req);
  return res || NextResponse.next();
});

// One config only. Use Clerk's recommended matcher plus API routes.
export const config = {
  matcher: [
    // Skip Next.js internals and static files unless in query
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
