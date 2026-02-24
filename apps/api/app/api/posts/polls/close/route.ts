import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { notifyChannel } from "@/lib/pg-listener";
import { getUser } from "@/lib/auth";

const closePollSchema = z.object({
  postId: z.number(),
});

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user || !user.id || !user.defaultProfileId) {
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

    if (pollPost.authorProfile.userId !== Number(user.id)) {
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

    // ─────────────────────────────
    // Concurrency-safe closing
    // ─────────────────────────────
    let closedPoll = null;
    try {
      // Atomic update to prevent race between concurrent requests
      await prisma.poll.updateMany({
        where: { id: pollPost.poll.id, isClosed: false },
        data: { isClosed: true },
      });

      closedPoll = await prisma.poll.findUnique({
        where: { id: pollPost.poll.id },
        include: {
          options: { include: { votes: true } },
        },
      });

      // If poll was already closed by another request
      if (!closedPoll?.isClosed) {
        return NextResponse.json(
          { status: 0, message: "Poll is already closed" },
          { status: 409 }
        );
      }
    } catch (err: any) {
      if (err.code === "P2025") {
        return NextResponse.json(
          { status: 0, message: "Poll was already closed or not found" },
          { status: 409 }
        );
      }
      throw err;
    }

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
