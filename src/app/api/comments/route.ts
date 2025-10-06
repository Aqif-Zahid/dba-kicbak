import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comments, profiles, votes } from "@/db/schema";
import { eq, and, count, isNull, inArray } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const postId = Number(url.searchParams.get("postId"));
    if (!postId)
      return NextResponse.json({ error: "postId is required" }, { status: 400 });

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? Number(session.user.id) : null;

    // ✅ Get comments with author display names
    const rows = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        parentId: comments.parentId,
        authorDisplayName: profiles.displayName,
      })
      .from(comments)
      .leftJoin(profiles, eq(comments.authorProfileId, profiles.id))
      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt);

    const commentIds = rows.map((r) => r.id);

    // ✅ Fetch upvote/downvote counts
    const voteCounts =
      commentIds.length > 0
        ? await db
            .select({
              commentId: votes.commentId,
              voteType: votes.voteType,
              c: count(),
            })
            .from(votes)
            .where(inArray(votes.commentId, commentIds))
            .groupBy(votes.commentId, votes.voteType)
        : [];

    // ✅ Fetch this user’s own votes
    const userVotes =
      userId && commentIds.length > 0
        ? await db
            .select({
              commentId: votes.commentId,
              voteType: votes.voteType,
            })
            .from(votes)
            .where(and(inArray(votes.commentId, commentIds), eq(votes.userId, userId)))
        : [];

    // ✅ Build comment map
    const byId: Record<number, any> = {};
    rows.forEach((c) => {
      const ups = voteCounts.filter(
        (v) => v.commentId === c.id && v.voteType === "UPVOTE"
      );
      const downs = voteCounts.filter(
        (v) => v.commentId === c.id && v.voteType === "DOWNVOTE"
      );
      const uv = userVotes.find((v) => v.commentId === c.id);

      byId[c.id] = {
        ...c,
        upvotes: ups.length > 0 ? Number(ups[0].c) : 0,
        downvotes: downs.length > 0 ? Number(downs[0].c) : 0,
        userVote: uv?.voteType ?? null,
        replies: [],
      };
    });

    // ✅ Build nested structure
    const roots: any[] = [];
    Object.values(byId).forEach((c: any) => {
      if (c.parentId && byId[c.parentId]) {
        byId[c.parentId].replies.push(c);
      } else {
        roots.push(c);
      }
    });

    return NextResponse.json({ comments: roots });
  } catch (error) {
    console.error("Comments GET error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = Number(session.user.id);
    const { postId, content, parentId } = await req.json();

    if (!postId || !content)
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    });

    if (!profile)
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const inserted = await db
      .insert(comments)
      .values({
        postId,
        content,
        authorProfileId: profile.id,
        parentId: parentId ?? null,
      })
      .returning();

    return NextResponse.json({ success: true, comment: inserted[0] });
  } catch (error) {
    console.error("Comment POST error:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
