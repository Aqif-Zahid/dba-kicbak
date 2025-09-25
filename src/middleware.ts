import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUser } from "./lib/auth";

// Role-based route access
const routeRoles: Record<string, string[] | "ANY"> = {
  "/admins": ["ADMIN"], // Only admin
  "/users": "ANY", // Any authenticated user
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public assets
  if (
    pathname.startsWith("/logo.svg") ||
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const user = await getUser(req);
  // Check protected routes
  for (const [routePrefix, roles] of Object.entries(routeRoles)) {
    if (pathname.startsWith(routePrefix)) {
      // Not logged in → redirect to home
      if (!user) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      // Check roles
      if (
        roles !== "ANY" &&
        !(typeof user.role === "string" && roles.includes(user.role))
      ) {
        return NextResponse.redirect(new URL("/", req.url)); // Unauthorized
      }

      return NextResponse.next();
    }
  }

  // Default: allow other routes
  return NextResponse.next();
}

// Apply middleware to all routes except static files and API
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
