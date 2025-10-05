import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { votes, posts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// ✅ GET — Fetch upvote/downvote counts and current user’s vote
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? Number(session.user.id) : null;
    const postId = Number(req.nextUrl.searchParams.get("postId"));
    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

    const allVotes = await db.select().from(votes).where(eq(votes.postId, postId));

    const upvotes = allVotes.filter((v) => v.voteType === "UPVOTE").length;
    const downvotes = allVotes.filter((v) => v.voteType === "DOWNVOTE").length;

    const userVote = userId
      ? allVotes.find((v) => v.userId === userId)?.voteType || null
      : null;

    return NextResponse.json({ upvotes, downvotes, userVote });
  } catch (err) {
    console.error("GET /votes error:", err);
    return NextResponse.json({ error: "Failed to load votes" }, { status: 500 });
  }
}

// ✅ POST — Add or toggle a user’s vote on a post
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { postId, voteType } = await req.json();

    if (!postId || !voteType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Find existing vote
    const existing = await db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, userId), eq(votes.postId, postId)));

    if (existing.length > 0) {
      const currentVote = existing[0];
      if (currentVote.voteType === voteType) {
        // Toggle off (remove vote)
        await db.delete(votes).where(eq(votes.id, currentVote.id));
      } else {
        // Update to opposite vote
        await db
          .update(votes)
          .set({ voteType })
          .where(eq(votes.id, currentVote.id));
      }
    } else {
      // Insert new vote
      await db.insert(votes).values({
        userId,
        postId,
        voteType,
      });
    }

    // Recount votes for this post
    const allVotes = await db.select().from(votes).where(eq(votes.postId, postId));
    const upvotes = allVotes.filter((v) => v.voteType === "UPVOTE").length;
    const downvotes = allVotes.filter((v) => v.voteType === "DOWNVOTE").length;

    // Optionally, update aggregate counters in the posts table
    await db
      .update(posts)
      .set({ upvotes, downvotes })
      .where(eq(posts.id, postId));

    return NextResponse.json({
      success: true,
      upvotes,
      downvotes,
      userVote: voteType,
    });
  } catch (err) {
    console.error("POST /votes error:", err);
    return NextResponse.json({ error: "Failed to process vote" }, { status: 500 });
  }
}
