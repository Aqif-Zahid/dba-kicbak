import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { votes, posts, comments } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { and, eq, inArray } from "drizzle-orm";

// ✅ Type definition
type VoteType = "UPVOTE" | "DOWNVOTE" | null;

/**
 * POST /api/votes
 * Authenticated users can upvote or downvote posts/comments.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId, commentId, voteType } = await req.json();
    const userId = Number(session.user.id);

    if (!voteType || (!postId && !commentId)) {
      return NextResponse.json(
        { error: "Invalid vote payload" },
        { status: 400 }
      );
    }

    // 🔍 Check existing vote
    const existing = await db.query.votes.findFirst({
      where: and(
        eq(votes.userId, userId),
        postId
          ? eq(votes.postId, Number(postId))
          : eq(votes.commentId, Number(commentId))
      ),
    });

    // 🧩 Handle vote logic
    if (existing) {
      if (existing.voteType === voteType) {
        // Toggle off
        await db.delete(votes).where(eq(votes.id, existing.id));
      } else {
        // Switch vote type
        await db
          .update(votes)
          .set({ voteType })
          .where(eq(votes.id, existing.id));
      }
    } else {
      // Insert new vote
      await db.insert(votes).values({
        userId,
        postId: postId ? Number(postId) : null,
        commentId: commentId ? Number(commentId) : null,
        voteType,
      });
    }

    // ✅ Refresh counts and persist updates
    let upCount = 0;
    let downCount = 0;

    // --- Handle post votes ---
    if (postId) {
      const all = await db.query.votes.findMany({
        where: eq(votes.postId, Number(postId)),
      });
      upCount = all.filter((v) => v.voteType === "UPVOTE").length;
      downCount = all.filter((v) => v.voteType === "DOWNVOTE").length;

      await db
        .update(posts)
        .set({ upvotes: upCount, downvotes: downCount })
        .where(eq(posts.id, Number(postId)));
    }

    // --- Handle comment votes ---
    if (commentId) {
      const all = await db.query.votes.findMany({
        where: eq(votes.commentId, Number(commentId)),
      });
      upCount = all.filter((v) => v.voteType === "UPVOTE").length;
      downCount = all.filter((v) => v.voteType === "DOWNVOTE").length;

      // ✅ Persist counts to comments table too
      await db
        .update(comments)
        .set({ upvotes: upCount, downvotes: downCount })
        .where(eq(comments.id, Number(commentId)));
    }

    return NextResponse.json({
      success: true,
      upvotes: upCount,
      downvotes: downCount,
    });
  } catch (err) {
    console.error("Vote error:", err);
    return NextResponse.json(
      { error: "Something went wrong while voting" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/votes
 * Public route — returns upvote/downvote counts for one or more posts/comments.
 *
 * Examples:
 *   /api/votes?postId=12
 *   /api/votes?commentId=99
 *   /api/votes?postIds=1,2,3,4
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const commentId = searchParams.get("commentId");
    const postIdsParam = searchParams.get("postIds");

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? Number(session.user.id) : null;

    // Single post/comment mode
    if (postId || commentId) {
      const whereClause = postId
        ? eq(votes.postId, Number(postId))
        : eq(votes.commentId, Number(commentId));

      const targetVotes = await db.query.votes.findMany({ where: whereClause });

      const upvotes = targetVotes.filter((v) => v.voteType === "UPVOTE").length;
      const downvotes = targetVotes.filter((v) => v.voteType === "DOWNVOTE").length;

      let userVote: "UPVOTE" | "DOWNVOTE" | null = null;
      if (userId) {
        const uv = targetVotes.find((v) => v.userId === userId);
        userVote = uv?.voteType ?? null;
      }

      return NextResponse.json({
        success: true,
        upvotes,
        downvotes,
        userVote,
      });
    }

    // Bulk mode
    if (postIdsParam) {
      const ids = postIdsParam
        .split(",")
        .map((x) => Number(x))
        .filter((x) => !isNaN(x));

      if (ids.length === 0) {
        return NextResponse.json(
          { error: "No valid post IDs provided" },
          { status: 400 }
        );
      }

      const allVotes = await db.query.votes.findMany({
        where: inArray(votes.postId, ids),
      });

      const result: Record<
        number,
        { upvotes: number; downvotes: number; userVote?: VoteType | null }
      > = {};

      for (const id of ids) {
        const subset = allVotes.filter((v) => v.postId === id);
        result[id] = {
          upvotes: subset.filter((v) => v.voteType === "UPVOTE").length,
          downvotes: subset.filter((v) => v.voteType === "DOWNVOTE").length,
          userVote: userId
            ? subset.find((v) => v.userId === userId)?.voteType ?? null
            : null,
        };
      }

      return NextResponse.json({ success: true, results: result });
    }

    // No params
    return NextResponse.json(
      { error: "Provide postId, commentId, or postIds" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Vote GET error:", err);
    return NextResponse.json(
      { error: "Failed to load votes" },
      { status: 500 }
    );
  }
}
