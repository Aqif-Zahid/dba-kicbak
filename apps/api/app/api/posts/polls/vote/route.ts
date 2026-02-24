import { NextResponse, NextRequest } from "next/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { notifyChannel } from "@/lib/pg-listener";

const voteSchema = z.object({
  pollOptionId: z.number(),
});

export async function POST(req: NextRequest) {
  // Ensure Prisma is connected (prevents "Engine not connected" on cold starts)
  await prisma.$connect().catch((err) =>
    console.warn("Prisma connect retry:", err)
  );

  try {
    const user = await getUser(req);
    if (!user) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: No active session" },
        { status: 401 }
      );
    }

    const userId = Number(user.id);
    const json = await req.json();
    const parsed = voteSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { status: 0, message: "Invalid vote data" },
        { status: 400 }
      );
    }

    const { pollOptionId } = parsed.data;

    // Get profile
    const profile = await prisma.profiles.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json(
        { status: 0, message: "Profile not found" },
        { status: 404 }
      );
    }

    // Get poll option + parent poll
    const option = await prisma.pollOption.findUnique({
      where: { id: pollOptionId },
      include: { poll: true },
    });

    if (!option) {
      return NextResponse.json(
        { status: 0, message: "Poll option not found" },
        { status: 404 }
      );
    }

    if (option.poll.isClosed) {
      return NextResponse.json(
        { status: 0, message: "Poll is closed" },
        { status: 409 }
      );
    }

    if (option.poll.expiresAt < new Date()) {
      return NextResponse.json(
        { status: 0, message: "Poll has expired" },
        { status: 409 }
      );
    }

    const allowMultiple = Boolean(option.poll.allowMultiple);
    const profileId = Number(profile.id);
    const pollId = Number(option.pollId);

    // Transaction-safe voting logic
    async function executeTransaction() {
      return prisma.$transaction(async (tx) => {
        const existingVote = await tx.pollVote.findUnique({
          where: {
            optionId_profileId: { optionId: pollOptionId, profileId },
          },
        });

        if (allowMultiple) {
          // Multi-vote polls: toggle this option
          if (existingVote) {
            await tx.pollVote.delete({ where: { id: existingVote.id } }).catch((err: any) => {
              if (err.code !== "P2025") throw err;
            });
          } else {
            await tx.pollVote.create({ data: { optionId: pollOptionId, profileId } }).catch((err: any) => {
              if (err.code !== "P2002") throw err;
            });
          }
        } else {
          // Single-vote polls: remove others first
          if (existingVote) {
            await tx.pollVote.delete({ where: { id: existingVote.id } }).catch((err: any) => {
              if (err.code !== "P2025") throw err;
            });
          } else {
            await tx.pollVote.deleteMany({
              where: { profileId, option: { pollId } },
            });
            await tx.pollVote.create({ data: { optionId: pollOptionId, profileId } }).catch((err: any) => {
              if (err.code !== "P2002") throw err;
            });
          }
        }

        return tx.poll.findUnique({
          where: { id: pollId },
          include: { options: { include: { votes: true } } },
        });
      });
    }

    // Attempt + retry logic for transaction aborts
    let result;
    try {
      result = await executeTransaction();
    } catch (err: any) {
      if (err.message?.includes("aborted") || err.code === "25P02") {
        console.warn("Retrying poll transaction after aborted state:", err);
        await prisma.$connect().catch(() => {}); // reconnect if needed
        result = await executeTransaction();
      } else {
        throw err;
      }
    }

    // Realtime update broadcast
    await notifyChannel("poll_updates", { pollId });

    return NextResponse.json(
      { status: 1, message: "Vote updated", data: result },
      { status: 200 }
    );
  } catch (err) {
    console.error("Vote poll error:", err);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
