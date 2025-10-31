import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { notifyChannel } from "@/lib/pg-listener";

const createPollSchema = z.object({
  communityId: z.number(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().optional(),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "At least 2 options required")
    .max(10, "Maximum 10 options allowed"),
  duration: z.object({
    days: z.number().int().min(0).max(3),
    hours: z.number().int().min(0).max(24),
    minutes: z.number().int().min(0).max(60),
  }),
  allowMultiple: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: No active session" },
        { status: 401 }
      );
    }

    const json = await req.json();
    const parsed = createPollSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { status: 0, message: "Invalid poll data", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { communityId, title, content, options, duration, allowMultiple } = parsed.data;

    const totalMinutes =
      duration.days * 24 * 60 + duration.hours * 60 + duration.minutes;

    if (totalMinutes <= 0) {
      return NextResponse.json(
        { status: 0, message: "Poll duration must be greater than 0 minutes" },
        { status: 400 }
      );
    }
    if (totalMinutes > 72 * 60) {
      return NextResponse.json(
        { status: 0, message: "Poll duration cannot exceed 72 hours" },
        { status: 400 }
      );
    }

    const expiresAt = new Date(Date.now() + totalMinutes * 60 * 1000);

    // Resolve author's profile
    const authorProfile = await prisma.profiles.findFirst({
      where: { userId: Number(userId) },
      select: { id: true },
    });
    if (!authorProfile) {
      return NextResponse.json(
        { status: 0, message: "Author profile not found" },
        { status: 404 }
      );
    }

    // Create Post + Poll (+ Options)
    const created = await prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          communityId,
          title,
          content: content?.trim() || "",
          type: "POLL",
          status: "PUBLISHED",
          authorProfileId: authorProfile.id,
          allowComments: true,
        },
      });

      const poll = await tx.poll.create({
        data: {
          postId: post.id,
          expiresAt,
          isClosed: false,
          allowMultiple: Boolean(allowMultiple),
          options: {
            create: options.map((text) => ({ text: text.trim() })),
          },
        },
        include: { options: true },
      });

      return { post, poll };
    });

    await notifyChannel("poll_updates", {
      pollId: created.poll.id,
      postId: created.post.id,
      event: "created",
    });

    return NextResponse.json(
      { status: 1, message: "Poll created successfully", data: created },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create poll error:", err);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
