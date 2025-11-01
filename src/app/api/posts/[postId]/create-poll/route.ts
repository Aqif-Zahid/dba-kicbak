import { NextResponse, NextRequest } from "next/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createPollSchema = z.object({
  communityId: z.number(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().optional(),
  options: z.array(z.string().min(1, "Option cannot be empty")).min(2).max(10),
  duration: z.object({
    days: z.number().int().min(0).max(3),
    hours: z.number().int().min(0).max(24),
    minutes: z.number().int().min(0).max(60),
  }),
  allowMultiple: z.boolean().optional().default(false),
  allowComments: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    const userId = Number(user?.id);

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
        { status: 0, message: "Invalid poll data" },
        { status: 400 }
      );
    }

    const {
      communityId,
      title,
      content,
      options,
      duration,
      allowMultiple,
      allowComments,
    } = parsed.data;

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

    const post = await prisma.post.create({
      data: {
        communityId,
        title,
        content: content ?? "",
        type: "POLL",
        status: "PUBLISHED",
        allowComments,
        authorProfileId: authorProfile.id,
        poll: {
          create: {
            expiresAt,
            allowMultiple,
            options: {
              create: options.map((text) => ({ text })),
            },
          },
        },
      },
      include: {
        poll: { include: { options: true } },
      },
    });

    return NextResponse.json(
      { status: 1, message: "Poll created successfully", data: post },
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
