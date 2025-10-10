import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getCurrentUserId } from "@/helpers/get-current-user-id";

type VoteType = "UPVOTE" | "DOWNVOTE" | null;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getCurrentUserId(session);
    if (!session?.user || !userId) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      postId,
      commentId,
      voteType,
    }: { postId?: number; commentId?: number; voteType?: VoteType } =
      await req.json();

    if (!voteType || (!postId && !commentId)) {
      return NextResponse.json(
        { status: 0, message: "Invalid vote payload" },
        { status: 400 }
      );
    }

    // Check existing vote
    const existing = await prisma.vote.findFirst({
      where: {
        userId,
        ...(postId ? { postId } : { commentId }),
      },
    });

    if (existing) {
      if (existing.voteType === voteType) {
        // Toggle off
        await prisma.vote.delete({ where: { id: existing.id } });
      } else {
        // Switch vote type
        await prisma.vote.update({
          where: { id: existing.id },
          data: { voteType },
        });
      }
    } else {
      // Insert new vote
      await prisma.vote.create({
        data: {
          userId,
          postId: postId ?? null,
          commentId: commentId ?? null,
          voteType,
        },
      });
    }

    // Update counts
    let upCount = 0;
    let downCount = 0;

    if (postId) {
      const votesForPost = await prisma.vote.findMany({ where: { postId } });
      upCount = votesForPost.filter((v) => v.voteType === "UPVOTE").length;
      downCount = votesForPost.filter((v) => v.voteType === "DOWNVOTE").length;

      await prisma.post.update({
        where: { id: postId },
        data: { upvotes: upCount, downvotes: downCount },
      });
    }

    if (commentId) {
      const votesForComment = await prisma.vote.findMany({
        where: { commentId },
      });
      upCount = votesForComment.filter((v) => v.voteType === "UPVOTE").length;
      downCount = votesForComment.filter(
        (v) => v.voteType === "DOWNVOTE"
      ).length;

      await prisma.comment.update({
        where: { id: commentId },
        data: { upvotes: upCount, downvotes: downCount },
      });
    }

    return NextResponse.json({
      status: 1,
      upvotes: upCount,
      downvotes: downCount,
    });
  } catch (err) {
    console.error("Vote error:", err);
    return NextResponse.json(
      { status: 0, message: "Something went wrong while voting" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/votes
 * Public route — returns upvote/downvote counts for one or more posts/comments.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const commentId = searchParams.get("commentId");
    const postIdsParam = searchParams.get("postIds");

    const session = await getServerSession(authOptions);
    const userId = getCurrentUserId(session);

    // Single post/comment
    if (postId || commentId) {
      const votesForTarget = await prisma.vote.findMany({
        where: postId
          ? { postId: Number(postId) }
          : { commentId: Number(commentId) },
      });

      const upvotes = votesForTarget.filter(
        (v) => v.voteType === "UPVOTE"
      ).length;
      const downvotes = votesForTarget.filter(
        (v) => v.voteType === "DOWNVOTE"
      ).length;
      const userVote: VoteType = userId
        ? votesForTarget.find((v) => v.userId === userId)?.voteType ?? null
        : null;

      return NextResponse.json({ status: 1, upvotes, downvotes, userVote });
    }

    // Bulk postIds
    if (postIdsParam) {
      const ids = postIdsParam
        .split(",")
        .map((x) => Number(x))
        .filter((x) => !isNaN(x));

      if (ids.length === 0) {
        return NextResponse.json(
          { status: 0, message: "No valid post IDs provided" },
          { status: 400 }
        );
      }

      const allVotes = await prisma.vote.findMany({
        where: { postId: { in: ids } },
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

      return NextResponse.json({ status: 1, results: result });
    }

    return NextResponse.json(
      { status: 0, message: "Provide postId, commentId, or postIds" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Vote GET error:", err);
    return NextResponse.json(
      { status: 0, message: "Failed to load votes" },
      { status: 500 }
    );
  }
}
