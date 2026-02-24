import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NotificationCountInfo } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // 🔹 Get logged-in user
    const currentUser = await getUser(req);
    if (!currentUser) {
      return NextResponse.json(
        { status: 0, message: "User Unauthorized!" },
        { status: 401 }
      );
    }

    const count = await prisma.notification.count({
      where: {
        recipientId: Number((currentUser as { id: number }).id),
        read: false,
      },
    });

    const data: NotificationCountInfo = {
      unreadCount: count,
    };

    return Response.json(data);
  } catch (err) {
    console.log(err);
    return Response.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
