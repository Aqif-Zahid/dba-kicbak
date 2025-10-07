import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, profiles, comments, communities } from "@/db/schema";
import { desc, eq, isNull } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// ===============================
//  CREATE POST
// ===============================
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, communityId } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content required" },
        { status: 400 }
      );
    }

    //  Find the author's profile
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, Number((session.user as any).id)))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const authorProfileId = profile.id;

    //  Find or create a default "General" community if none is provided
    let selectedCommunityId: number;
    if (communityId) {
      selectedCommunityId = Number(communityId);
    } else {
      const existing = await db
        .select()
        .from(communities)
        .where(eq(communities.slug, "general"))
        .limit(1);

      if (existing.length > 0) {
        selectedCommunityId = existing[0].id;
      } else {
        const [createdCommunity] = await db
          .insert(communities)
          .values({
            name: "General",
            slug: "general",
            description: "Default community for general discussions",
            ownerId: Number((session.user as any).id),
          })
          .returning();
        selectedCommunityId = createdCommunity.id;
      }
    }

    //  Insert new post
    const inserted = await db
      .insert(posts)
      .values({
        authorProfileId,
        communityId: selectedCommunityId,
        title,
        content,
        status: "PUBLISHED",
      })
      .returning();

    return NextResponse.json({ success: true, post: inserted[0] });
  } catch (err) {
    console.error("Create post error:", err);
    return NextResponse.json(
      { error: "Something went wrong while creating the post" },
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

    //  Relation-based fetch with author, votes, and top-level comment counts
    const rows = await db.query.posts.findMany({
      orderBy: [desc(posts.createdAt)],
      limit: limit && !Number.isNaN(limit) ? limit : undefined,
      with: {
        authorProfile: true,
        votes: true,
        comments: {
          where: isNull(comments.parentId),
          columns: { id: true },
        },
      },
    });

    //  Format and return (mask deleted posts)
    const formatted = rows.map((p) => {
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
        status: p.status, //  include status so frontend knows if deleted
      };
    });

    return NextResponse.json({ posts: formatted });
  } catch (err) {
    console.error("Posts GET error:", err);
    return NextResponse.json({ error: "Failed to load posts" }, { status: 500 });
  }
}
