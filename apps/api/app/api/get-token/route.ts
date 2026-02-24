import { getUser } from "@/lib/auth";
import streamServerClient from "@/lib/stream";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);

    if (!user) {
      return Response.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;
    const issuedAt = Math.floor(Date.now() / 1000) - 60;

    const token = streamServerClient.createToken(
      String(user.defaultProfileId),
      expirationTime,
      issuedAt
    );

    return NextResponse.json({ token });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
