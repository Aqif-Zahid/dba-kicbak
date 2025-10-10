import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, communityId } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { status: 0, message: "Title and content required" },
        { status: 422 }
      );
    }

    // Find the author's default profile
    const profile = await prisma.profiles.findFirst({
      where: { user: { email: session.user.email ?? undefined } },
      include: { user: true },
    });

    if (!profile) {
      return NextResponse.json(
        { status: 0, message: "Profile not found" },
        { status: 422 }
      );
    }

    const authorProfileId = profile.id;

    // Find or create "General" community
    let selectedCommunityId: number;
    if (communityId) {
      selectedCommunityId = Number(communityId);
    } else {
      let generalCommunity = await prisma.community.findFirst({
        where: { slug: "general" },
      });

      if (!generalCommunity) {
        generalCommunity = await prisma.community.create({
          data: {
            name: "General",
            slug: "general",
            description: "Default community for general discussions",
            ownerId: Number(profile.userId),
          },
        });
      }

      selectedCommunityId = generalCommunity.id;
    }

    // Create new post
    const newPost = await prisma.post.create({
      data: {
        authorProfileId,
        communityId: selectedCommunityId,
        title,
        content,
        status: "PUBLISHED",
      },
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch (err) {
    console.error("Create post error:", err);
    return NextResponse.json(
      { status: 0, message: "Something went wrong while creating the post" },
      { status: 500 }
    );
  }
}

// ===============================
//  GET ALL POSTS (with relations)
// ===============================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") ?? 0);

    // Fetch posts with author, votes, and top-level comment count
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: limit && !Number.isNaN(limit) ? limit : undefined,
      include: {
        authorProfile: true,
        votes: true,
        comments: {
          where: { parentId: null },
          select: { id: true },
        },
      },
    });

    // Format response
    const formatted = posts.map((p) => {
      const isDeleted = p.status === "DELETED";

      return {
        id: p.id,
        title: isDeleted ? "[deleted]" : p.title,
        content: isDeleted ? "[deleted]" : p.content,
        createdAt: p.createdAt,
        authorDisplayName: isDeleted
          ? "[deleted user]"
          : p.authorProfile?.displayName ?? "User",
        upvotes: p.votes.filter((v) => v.voteType === "UPVOTE").length,
        downvotes: p.votes.filter((v) => v.voteType === "DOWNVOTE").length,
        commentCount: p.comments.length,
        status: p.status,
      };
    });

    return NextResponse.json({ posts: formatted });
  } catch (err) {
    console.error("Posts GET error:", err);
    return NextResponse.json(
      { status: 0, message: "Failed to load posts" },
      { status: 500 }
    );
  }
}
