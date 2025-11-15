import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// ------------------------
// POST: Join a community
// ------------------------
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser(req);

    if (!user) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const communityId = Number(params.id);
    if (!communityId) {
      return NextResponse.json(
        { status: 0, message: "Community ID is required" },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: { members: { where: { id: Number(user.defaultProfileId) } } },
    });

    if (!community) {
      return NextResponse.json(
        { status: 0, message: "Community not found" },
        { status: 404 }
      );
    }

    if (community.members.length > 0) {
      return NextResponse.json(
        { status: 0, message: "You are already a member" },
        { status: 400 }
      );
    }

    // Add user to community members
    await prisma.community.update({
      where: { id: communityId },
      data: {
        members: {
          connect: { id: Number(user.defaultProfileId) },
        },
      },
    });

    return NextResponse.json({ status: 1, message: "Joined successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Failed to join community" },
      { status: 500 }
    );
  }
}
