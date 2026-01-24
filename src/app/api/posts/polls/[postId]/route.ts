import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    // Ensure Prisma is connected (handles Vercel cold starts)
    await prisma.$connect().catch((err) =>
      console.warn("Prisma connect retry:", err)
    );

    const { postId } = await context.params;
    const postIdNum = Number(postId);

    if (isNaN(postIdNum)) {
      return NextResponse.json(
        { status: 0, message: "Invalid post ID" },
        { status: 400 }
      );
    }

    const user = await getUser(req);
    const profileId = user?.defaultProfileId ?? null;

    // Fetch post and poll in one go
    const post = await prisma.post.findUnique({
      where: { id: postIdNum },
      include: {
        poll: {
          include: {
            options: {
              include: {
                votes: { select: { profileId: true } },
              },
            },
          },
        },
        authorProfile: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });

    if (!post || !post.poll) {
      return NextResponse.json(
        { status: 0, message: "Poll not found for this post" },
        { status: 404 }
      );
    }

    const poll = post.poll;
    const now = new Date();

    const expired = poll.expiresAt < now;
    const isClosed = poll.isClosed || expired;
    const timeLeftMs = Math.max(0, poll.expiresAt.getTime() - now.getTime());

    // Aggregate votes safely
    const totalVotes =
      poll.options?.reduce((sum, opt) => sum + opt.votes.length, 0) ?? 0;

    const options =
      poll.options?.map((opt) => ({
        id: opt.id,
        text: opt.text,
        voteCount: opt.votes.length,
        votedByUser: !!opt.votes.find((v) => v.profileId === profileId),
        percentage:
          totalVotes === 0
            ? 0
            : Math.round((opt.votes.length / totalVotes) * 100),
      })) ?? [];

    const userHasVoted = options.some((opt) => opt.votedByUser);
    const canViewResults = isClosed || userHasVoted;

    // Auto-close expired polls
    if (expired && !poll.isClosed) {
      prisma.poll
        .update({
          where: { id: poll.id },
          data: { isClosed: true },
        })
        .catch((err) =>
          console.warn("Non-critical: failed to auto-close expired poll:", err)
        );
    }

    return NextResponse.json(
      {
        status: 1,
        message: "Poll fetched successfully",
        data: {
          postId: post.id,
          author: post.authorProfile,
          pollId: poll.id,
          isClosed,
          expiresAt: poll.expiresAt,
          timeLeftMs,
          options,
          totalVotes,
          userHasVoted,
          allowMultiple: Boolean(poll.allowMultiple),
          canViewResults,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Get poll error:", err);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
