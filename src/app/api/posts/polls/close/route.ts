import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { notifyChannel } from "@/lib/pg-listener";

const closePollSchema = z.object({
  postId: z.number(),
});

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = Number(session?.user?.id);

    if (!userId) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: No active session" },
        { status: 401 }
      );
    }

    const json = await req.json();
    const parsed = closePollSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { status: 0, message: "Invalid input" },
        { status: 400 }
      );
    }

    const { postId } = parsed.data;

    const pollPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        poll: true,
        authorProfile: { select: { userId: true } },
      },
    });

    if (!pollPost || pollPost.type !== "POLL" || !pollPost.poll) {
      return NextResponse.json(
        { status: 0, message: "Poll not found" },
        { status: 404 }
      );
    }

    if (pollPost.authorProfile.userId !== userId) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: You are not the poll creator" },
        { status: 403 }
      );
    }

    if (pollPost.poll.isClosed) {
      return NextResponse.json(
        { status: 0, message: "Poll is already closed" },
        { status: 409 }
      );
    }

    const closedPoll = await prisma.poll.update({
      where: { id: pollPost.poll.id },
      data: { isClosed: true },
      include: {
        options: { include: { votes: true } },
      },
    });

    // Broadcast to SSE stream
    await notifyChannel("poll_updates", { pollId: pollPost.poll.id });

    return NextResponse.json(
      {
        status: 1,
        message: "Poll closed successfully",
        data: closedPoll,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Close poll error:", err);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
