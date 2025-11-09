import { NextResponse, NextRequest } from "next/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { notifyChannel } from "@/lib/pg-listener";

const voteSchema = z.object({
  pollOptionId: z.number(),
});

export async function POST(req: NextRequest) {
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

    // Profile
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

    // Option + Poll (need allowMultiple)
    const option = await prisma.pollOption.findUnique({
      where: { id: pollOptionId },
      include: {
        poll: true, // must include allowMultiple, isClosed, expiresAt
      },
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

    const result = await prisma.$transaction(async (tx) => {
      // Check if this user already voted for this option
      const existingVote = await tx.pollVote.findUnique({
        where: {
          optionId_profileId: {
            optionId: Number(pollOptionId),
            profileId: Number(profile.id),
          },
        },
      });

      if (allowMultiple) {
        // ─────────────────────────────
        // Multi-choice poll logic
        // ─────────────────────────────
        if (existingVote) {
          // Toggle off (remove)
          try {
            await tx.pollVote.delete({
              where: { id: existingVote.id },
            });
          } catch (err: any) {
            if (err.code !== "P2025") throw err; // Ignore if already deleted
          }
        } else {
          // Toggle on (add)
          try {
            await tx.pollVote.create({
              data: {
                optionId: Number(pollOptionId),
                profileId: Number(profile.id),
              },
            });
          } catch (err: any) {
            if (err.code !== "P2002") throw err; // Ignore duplicate insertion
          }
        }
      } else {
        // ─────────────────────────────
        // Single-choice poll logic
        // ─────────────────────────────
        if (existingVote) {
          // Unvote current option
          try {
            await tx.pollVote.delete({
              where: { id: existingVote.id },
            });
          } catch (err: any) {
            if (err.code !== "P2025") throw err;
          }
        } else {
          // Remove all other votes from same poll (if any)
          await tx.pollVote.deleteMany({
            where: {
              profileId: Number(profile.id),
              option: { pollId: Number(option.pollId) },
            },
          });

          // Try to insert safely
          try {
            await tx.pollVote.create({
              data: {
                optionId: Number(pollOptionId),
                profileId: Number(profile.id),
              },
            });
          } catch (err: any) {
            if (err.code !== "P2002") throw err; // ignore duplicate if concurrent
          }
        }
      }

      // Return updated snapshot
      const updatedPoll = await tx.poll.findUnique({
        where: { id: Number(option.pollId) },
        include: {
          options: {
            include: { votes: true },
          },
        },
      });
      return updatedPoll;
    });

    await notifyChannel("poll_updates", { pollId: Number(option.pollId) });

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
