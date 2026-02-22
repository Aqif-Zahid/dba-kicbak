import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user)
    return NextResponse.json(
      { status: 0, message: "Unauthorized" },
      { status: 401 }
    );

  const currentProfileId = Number(user.defaultProfileId);
  if (!currentProfileId)
    return NextResponse.json(
      { status: 0, message: "No default profile" },
      { status: 400 }
    );

  try {
    const usersToFollow = await prisma.profiles.findMany({
      where: {
        NOT: { id: currentProfileId },
        followers: { none: { followerId: currentProfileId } },
      },
      select: {
        id: true,
        userId: true,
        role: true,
        username: true,
        displayName: true,
        profilePicture: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        followers: { select: { followerId: true } },
        _count: { select: { followers: true } },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    const profiles = usersToFollow.map((p) => ({
      id: p.id,
      userId: p.userId,
      role: p.role,
      username: p.username,
      displayName: p.displayName,
      profilePicture: p.profilePicture,
      bio: p.bio,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      followers: p.followers,
      _count: { followers: p._count.followers },
      // helpful for UI
      isFollowedByUser: p.followers.some((f) => f.followerId === currentProfileId),
    }));

    return NextResponse.json({ status: 1, data: profiles });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
