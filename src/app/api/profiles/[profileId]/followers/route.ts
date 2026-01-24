import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await context.params;
    const loggedInUser = await getUser(req);
    if (!loggedInUser) {
      return Response.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.profiles.findUnique({
      where: { id: Number(profileId) },
      select: {
        followers: {
          where: {
            followerId: Number(loggedInUser.defaultProfileId),
          },
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json(
        { status: 0, message: "User not found" },
        { status: 404 }
      );
    }
    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length,
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

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await context.params;
    const loggedInUser = await getUser(req);
    if (!loggedInUser) {
      return Response.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await prisma.$transaction([
      prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: Number(loggedInUser.defaultProfileId),
            followingId: Number(profileId),
          },
        },
        create: {
          followerId: Number(loggedInUser.defaultProfileId),
          followingId: Number(profileId),
        },
        update: {},
      }),
      //Notifications
      prisma.notification.create({
        data: {
          issuerId: Number(loggedInUser.defaultProfileId),
          recipientId: Number(profileId),
          type: "FOLLOW",
        },
      }),
    ]);

    return new Response();
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await context.params; // Destructure inside
    const loggedInUser = await getUser(req);
    if (!loggedInUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: {
          followerId: Number(loggedInUser.defaultProfileId),
          followingId: Number(profileId),
        },
      }),
      //Notifications
      prisma.notification.deleteMany({
        where: {
          issuerId: Number(loggedInUser.defaultProfileId),
          recipientId: Number(profileId),
          type: "FOLLOW",
        },
      }),
    ]);
    return new NextResponse();
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
