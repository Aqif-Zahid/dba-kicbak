import { getUser } from "@/lib/auth";
import streamServerClient from "@/lib/stream";
import { MessageCountInfo } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { total_unread_count } = await streamServerClient.getUnreadCount(
      String(user.defaultProfileId)
    );

    const data: MessageCountInfo = {
      unreadCount: total_unread_count,
    };

    return NextResponse.json(data);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
