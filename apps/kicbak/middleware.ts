import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const middleware = (_req: NextRequest) => {
  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
