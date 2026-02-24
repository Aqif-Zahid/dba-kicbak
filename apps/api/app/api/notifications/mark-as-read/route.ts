import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }
    await prisma.notification.updateMany({
      where: {
        recipientId: Number(user.defaultProfileId),
        read: false,
      },
      data: {
        read: true,
      },
    });

    return new NextResponse();
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
