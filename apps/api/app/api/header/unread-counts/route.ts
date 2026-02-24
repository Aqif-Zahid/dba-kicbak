import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import streamServerClient from "@/lib/stream";

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user)
    return NextResponse.json(
      { status: 0, message: "Unauthorized" },
      { status: 401 }
    );

  try {
    // Best-effort: ensure Stream user exists
    try {
      await streamServerClient.upsertUser({
        id: String(user.defaultProfileId),
        username: (user as any)?.username || `user_${user.defaultProfileId}`,
        name: (user as any)?.displayName || "Unknown",
      });
    } catch (err) {
      console.error("Failed to upsert Stream user:", err);
    }

    const [unreadNotificationsCount, unreadMessagesCount] = await Promise.all([
      prisma.notification.count({
        where: {
          recipient: { id: Number(user.defaultProfileId) },
          read: false,
        },
      }),
      streamServerClient
        .getUnreadCount(String(user.defaultProfileId))
        .then((res) => res.total_unread_count),
    ]);

    return NextResponse.json({
      status: 1,
      data: { unreadNotificationsCount, unreadMessagesCount },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
