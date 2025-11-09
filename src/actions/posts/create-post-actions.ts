"use server";

import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCurrentProfileId } from "@/helpers/get-current-user-id";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { getPostsDataInclude } from "@/types/types";

// ─────────────────────────────
// Validation Schema
// ─────────────────────────────
const basePostSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    content: z.string().max(500).optional(),
    communityId: z.number().optional(),
    mediaIds: z.array(z.string()).max(5, "Cannot have more than 5 attachments"),
    type: z.enum(["POLL", "QUESTION", "DISCUSSION"]).default("DISCUSSION"),
    allowComments: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // content required for QUESTION or DISCUSSION
      if (data.type !== "POLL") {
        return data.content && data.content.trim().length >= 3;
      }
      // for POLL, content can be optional or non-empty
      return true;
    },
    {
      message: "Content must be at least 3 characters long",
      path: ["content"],
    }
  );

const pollFieldsSchema = z.object({
  options: z.array(z.string()).min(2, "Poll must have at least 2 options"),
  duration: z.object({
    days: z.number().min(0),
    hours: z.number().min(0),
    minutes: z.number().min(0),
  }),
  allowMultiple: z.boolean().default(false),
});

// ─────────────────────────────
// Unified Post Creation Action
// ─────────────────────────────
export async function createPost(input: {
  title: string;
  content?: string;
  communityId?: number;
  mediaIds: string[];
  type?: "POLL" | "QUESTION" | "DISCUSSION";
  allowComments?: boolean;
  // optional poll fields
  options?: string[];
  duration?: { days: number; hours: number; minutes: number };
  allowMultiple?: boolean;
}) {
  const session = await getServerSession(authOptions);
  const currentProfileId = getCurrentProfileId(session);
  if (!currentProfileId) {
    throw new Error("Unauthorized");
  }

  // parse base schema
  const baseData = basePostSchema.parse(input);
  const { title, content, communityId, mediaIds, type, allowComments } = baseData;

  // find or create default "general" community if none provided
  const selectedCommunity =
    (communityId &&
      (await prisma.community.findUnique({ where: { id: communityId } }))) ||
    (await prisma.community.upsert({
      where: { slug: "general" },
      update: {},
      create: {
        name: "General",
        slug: "general",
        description: "Default community for general discussions",
        ownerId: currentProfileId,
      },
    }));

  // ─────────────────────────────
  // Create the base post first
  // ─────────────────────────────
  const newPost = await prisma.post.create({
    data: {
      title,
      content: content ?? "",
      authorProfileId: currentProfileId,
      communityId: selectedCommunity.id,
      attachment: {
        connect: mediaIds.map((id) => ({ id })),
      },
      status: "PUBLISHED",
      type,
      allowComments,
    },
    include: getPostsDataInclude(currentProfileId),
  });

  // ─────────────────────────────
  // Handle poll-specific logic
  // ─────────────────────────────
  if (type === "POLL") {
    const { options, duration, allowMultiple } = pollFieldsSchema.parse({
      options: input.options,
      duration: input.duration,
      allowMultiple: input.allowMultiple,
    });

    // calculate expiration
    const expiresAt = new Date();
    const totalMinutes =
      duration.days * 24 * 60 + duration.hours * 60 + duration.minutes;
    expiresAt.setMinutes(expiresAt.getMinutes() + totalMinutes);

    const poll = await prisma.poll.create({
      data: {
        postId: newPost.id,
        expiresAt,
        allowMultiple,
        options: {
          create: options.map((opt) => ({ text: opt })),
        },
      },
    });

    return {
      ...newPost,
      poll,
    };
  }

  // ─────────────────────────────
  // Return final post
  // ─────────────────────────────
  return newPost;
}
