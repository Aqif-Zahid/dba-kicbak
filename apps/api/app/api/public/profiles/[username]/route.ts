import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const profile = await prisma.profiles.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    include: {
      user: true,
      _count: { select: { posts: true, followers: true, following: true } },
      followers: true,
    },
  });

  if (!profile) {
    return NextResponse.json({ status: 0, message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: 1,
    data: {
      ...profile,
      user: {
        id: profile.user.id,
        email: profile.user.email,
        createdAt: profile.user.createdAt ? profile.user.createdAt.toISOString() : null,
      },
      _count: {
        posts: profile._count.posts,
        followers: profile._count.followers,
        following: profile._count.following,
      },
      followers: profile.followers.map((f) => ({
        followerId: f.followerId,
        followingId: f.followingId,
      })),
    },
  });
}
