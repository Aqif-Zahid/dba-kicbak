import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notificationsInclude, NotificationsPage } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 10;

    const user = await getUser(req);
    if (!user) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: Number(user.defaultProfileId),
      },
      include: notificationsInclude,
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });
    const nextCursor =
      notifications.length > pageSize ? notifications[pageSize].id : null;
    const data: NotificationsPage = {
      notifications: notifications.slice(0, pageSize),
      nextCursor,
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
