import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getProfileDataSelect } from "@/types/types";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params; // Destructure inside
  try {
    const loggedInUser = await getUser(req);
    if (!loggedInUser) {
      return Response.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const user = await prisma.profiles.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
      select: getProfileDataSelect(Number(loggedInUser.defaultProfileId)),
    });

    if (!user) {
      return Response.json(
        { status: 0, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json(user);
  } catch (err) {
    console.log(err);
    return Response.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
