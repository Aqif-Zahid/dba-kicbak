import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;
    const postIdNum = Number(postId);

    if (isNaN(postIdNum)) {
      return NextResponse.json(
        { status: 0, message: "Invalid post ID" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Fetch post with poll, including allowMultiple
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

    // Expiration logic
    const now = new Date();
    const expired = poll.expiresAt < now;
    const timeLeftMs = Math.max(0, poll.expiresAt.getTime() - now.getTime());

    // Current user's profile id (if logged in)
    let userProfileId: number | null = null;
    if (userId) {
      const profile = await prisma.profiles.findFirst({
        where: { userId: Number(userId) },
        select: { id: true },
      });
      userProfileId = profile?.id ?? null;
    }

    // Aggregate options
    const totalVotes = poll.options.reduce(
      (sum, opt) => sum + opt.votes.length,
      0
    );

    const options = poll.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      voteCount: opt.votes.length,
      votedByUser: !!opt.votes.find((v) => v.profileId === userProfileId),
      percentage:
        totalVotes === 0 ? 0 : Math.round((opt.votes.length / totalVotes) * 100),
    }));

    // Only use allowMultiple from schema (no maxSelections)
    const allowMultiple = Boolean(poll.allowMultiple);

    const userHasVoted = options.some((opt) => opt.votedByUser);
    const isClosed = poll.isClosed || expired;

    // allow results viewing if poll is closed or user has voted
    const canViewResults = isClosed || userHasVoted;

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
          allowMultiple,
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
