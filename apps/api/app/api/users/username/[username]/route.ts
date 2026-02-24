import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getProfileDataSelect } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params; // Destructure inside
  try {
    const loggedInUser = await getUser(req);

    const user = await prisma.profiles.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
      select: getProfileDataSelect(
        loggedInUser ? Number(loggedInUser.defaultProfileId) : null
      ),
    });

    if (!user) {
      return NextResponse.json(
        { status: 0, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
