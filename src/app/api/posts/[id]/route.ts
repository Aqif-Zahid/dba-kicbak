import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, votes, profiles } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to get session — but allow unauthenticated users
    let userId: number | null = null;
    try {
      const session = await getServerSession(authOptions);
      userId = session?.user?.id ? Number(session.user.id) : null;
    } catch (e) {
      // gracefully ignore session errors for unsigned visitors
      userId = null;
    }

    const postId = Number(params.id);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Fetch post and author display name
    const rows = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        authorDisplayName: profiles.displayName,
      })
      .from(posts)
      .leftJoin(profiles, eq(posts.authorProfileId, profiles.id))
      .where(eq(posts.id, postId))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const base = rows[0];

    // Aggregate upvote/downvote counts
    const [upAgg] = await db
      .select({ c: count() })
      .from(votes)
      .where(and(eq(votes.postId, postId), eq(votes.voteType, "UPVOTE")));

    const [downAgg] = await db
      .select({ c: count() })
      .from(votes)
      .where(and(eq(votes.postId, postId), eq(votes.voteType, "DOWNVOTE")));

    // Determine user's vote (if logged in)
    let userVote: "UPVOTE" | "DOWNVOTE" | null = null;
    if (userId) {
      const existing = await db.query.votes.findFirst({
        where: and(eq(votes.postId, postId), eq(votes.userId, userId)),
      });
      userVote = existing?.voteType ?? null;
    }

    // Build response
    const hydratedPost = {
      id: base.id,
      title: base.title,
      content: base.content,
      createdAt: base.createdAt,
      authorDisplayName: base.authorDisplayName ?? "Unknown User",
      upvotes: Number(upAgg?.c ?? 0),
      downvotes: Number(downAgg?.c ?? 0),
      userVote,
    };

    return NextResponse.json({ post: hydratedPost }, { status: 200 });
  } catch (error) {
    console.error("Post GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
