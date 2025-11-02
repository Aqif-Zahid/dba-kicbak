import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";
import { encryptCookie } from "@/lib/encrypt";

export async function GET(req: NextRequest) {
  const url = new URL(req.url); // full incoming URL
  const id = url.searchParams.get("id");
  const email = url.searchParams.get("email");
  const displayName = url.searchParams.get("displayName") ?? "";
  const image = url.searchParams.get("image") ?? "";

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const encrypted = encryptCookie({ id, email, displayName, image });

  // Build absolute redirect URL
  const redirectUrl = `${url.origin}/complete-profile?userId=${id}&email=${email}`;

  const res = NextResponse.redirect(redirectUrl);
  res.headers.append(
    "Set-Cookie",
    serialize("pendingUser", encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/complete-profile",
      maxAge: 60 * 15, // 15 minutes
    })
  );

  return res;
}
