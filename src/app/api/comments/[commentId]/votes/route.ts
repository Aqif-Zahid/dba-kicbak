import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { VoteInfo } from "@/types/types";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await context.params;
    const loggedInUser = await getUser(req);

    if (!loggedInUser) {
      return Response.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const comment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
      select: {
        votes: {
          where: {
            profileId: Number(loggedInUser.defaultProfileId),
          },
          select: {
            profileId: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    if (!comment) {
      return Response.json(
        { status: 0, message: "Comment not found" },
        { status: 404 }
      );
    }
    const data: VoteInfo = {
      votes: comment._count.votes,
      isVotedByUser: !!comment.votes.length,
    };
    return Response.json(data);
  } catch (err) {
    return Response.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await context.params;
    const loggedInUser = await getUser(req);
    if (!loggedInUser) {
      return Response.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: {
        id: Number(commentId),
      },
      select: {
        authorProfileId: true,
      },
    });

    if (!comment) {
      return Response.json({ error: "Comment not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.commentVote.upsert({
        where: {
          profileId_commentId: {
            profileId: Number(loggedInUser.defaultProfileId),
            commentId: Number(commentId),
          },
        },
        create: {
          profileId: Number(loggedInUser.defaultProfileId),
          commentId: Number(commentId),
          voteType: "UPVOTE",
        },
        update: {},
      }),
    ]);

    return new Response();
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await context.params;
    const loggedInUser = await getUser(req);
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comment = await prisma.comment.findUnique({
      where: {
        id: Number(commentId),
      },
      select: {
        authorProfileId: true,
      },
    });

    if (!comment) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.commentVote.deleteMany({
        where: {
          profileId: Number(loggedInUser.defaultProfileId),
          commentId: Number(commentId),
        },
      }),
    ]);

    return new Response();
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
