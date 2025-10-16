import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { VoteInfo } from "@/types/types";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;
    const loggedInUser = await getUser(req);

    if (!loggedInUser) {
      return Response.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
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

    if (!post) {
      return Response.json(
        { status: 0, message: "Post not found" },
        { status: 404 }
      );
    }
    const data: VoteInfo = {
      votes: post._count.votes,
      isVotedByUser: !!post.votes.length,
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
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;
    const loggedInUser = await getUser(req);
    if (!loggedInUser) {
      return Response.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const post = await prisma.post.findUnique({
      where: {
        id: Number(postId),
      },
      select: {
        authorProfileId: true,
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.vote.upsert({
        where: {
          profileId_postId: {
            profileId: Number(loggedInUser.defaultProfileId),
            postId: Number(postId),
          },
        },
        create: {
          profileId: Number(loggedInUser.defaultProfileId),
          postId: Number(postId),
          voteType: "UPVOTE",
        },
        update: {},
      }),
      //Notifications
      ...(loggedInUser.id !== post.authorProfileId
        ? [
            prisma.notification.create({
              data: {
                issuerId: Number(loggedInUser.defaultProfileId),
                recipientId: post.authorProfileId,
                type: "VOTE",
                postId: Number(postId),
              },
            }),
          ]
        : []),
    ]);

    return new Response();
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;
    const loggedInUser = await getUser(req);
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: {
        id: Number(postId),
      },
      select: {
        authorProfileId: true,
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.vote.deleteMany({
        where: {
          profileId: Number(loggedInUser.defaultProfileId),
          postId: Number(postId),
        },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: Number(loggedInUser.defaultProfileId),
          recipientId: post.authorProfileId,
          type: "VOTE",
          postId: Number(postId),
        },
      }),
    ]);

    return new Response();
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
