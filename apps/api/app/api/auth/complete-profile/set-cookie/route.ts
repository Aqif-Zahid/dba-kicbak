import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";
import { encryptCookie } from "@/lib/encrypt";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const email = url.searchParams.get("email");
    const displayName = url.searchParams.get("displayName") ?? "";
    const image = url.searchParams.get("image") ?? "";

    // Validate first — before any encryption or serialization
    if (!id || !email) {
      return NextResponse.json(
        { status: 0, message: "Missing required parameters (id or email)" },
        { status: 400 }
      );
    }

    // Encrypt only after confirming both are present
    const encrypted = encryptCookie({ id, email, displayName, image });

    if (typeof encrypted !== "string" || !encrypted) {
      console.error("encryptCookie() returned invalid value:", encrypted);
      return NextResponse.json(
        { status: 0, message: "Failed to encrypt cookie value" },
        { status: 500 }
      );
    }

    // Build redirect URL
    const redirectUrl = `${url.origin}/complete-profile?userId=${id}&email=${email}`;

    // Serialize cookie safely
    const cookieHeader = serialize("pendingUser", encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/complete-profile",
      maxAge: 60 * 15, // 15 minutes
    });

    const res = NextResponse.redirect(redirectUrl);
    res.headers.append("Set-Cookie", cookieHeader);

    return res;
  } catch (error: any) {
    console.error("set-cookie route error:", error);
    return NextResponse.json(
      { status: 0, message: error?.message || "Unexpected error in set-cookie route" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
