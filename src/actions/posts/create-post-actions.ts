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
    content: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
    communityId: z.number().optional(),
    mediaIds: z.array(z.string()).max(5, "Cannot have more than 5 attachments"),
    type: z.enum(["POLL", "QUESTION", "DISCUSSION"]).default("DISCUSSION"),
    allowComments: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.type !== "POLL") {
        // Require at least 3 characters for non-poll posts
        return data.content && data.content.trim().length >= 3;
      }
      return true;
    },
    {
      message: "Description must be at least 3 characters long",
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
  options?: string[];
  duration?: { days: number; hours: number; minutes: number };
  allowMultiple?: boolean;
}) {
  try {
    const session = await getServerSession(authOptions);
    const currentProfileId = getCurrentProfileId(session);
    if (!currentProfileId) {
      return {
        status: 0,
        message: "Unauthorized",
      };
    }

    // ─────────────────────────────
    // Safe schema validation
    // ─────────────────────────────
    const parsed = basePostSchema.safeParse({
      ...input,
      title: input.title?.trim(),
      content: input.content?.trim(),
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return {
        status: 0,
        message: firstIssue?.message || "Invalid post data. Please check all fields.",
      };
    }

    const { title, content, communityId, mediaIds, type, allowComments } = parsed.data;

    // ─────────────────────────────
    // Strict backend guard
    // ─────────────────────────────
    if (type !== "POLL" && (!content || content.trim().length < 3)) {
      return {
        status: 0,
        message: "Description must be at least 3 characters long",
      };
    }

    // ─────────────────────────────
    // For Polls: validate BEFORE post creation
    // ─────────────────────────────
    let pollData: z.infer<typeof pollFieldsSchema> | null = null;

    if (type === "POLL") {
      const pollParsed = pollFieldsSchema.safeParse({
        options: input.options,
        duration: input.duration,
        allowMultiple: input.allowMultiple,
      });

      if (!pollParsed.success) {
        const firstIssue = pollParsed.error.issues[0];
        return {
          status: 0,
          message: firstIssue?.message || "Invalid poll data.",
        };
      }

      pollData = pollParsed.data;
    }

    // ─────────────────────────────
    // Find or create default "general" community
    // ─────────────────────────────
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
    // Handle Poll creation
    // ─────────────────────────────
    if (type === "POLL" && pollData) {
      const { options, duration, allowMultiple } = pollData;

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
        status: 1,
        message: "Poll created successfully",
        data: {
          ...newPost,
          poll,
        },
      };
    }

    // ─────────────────────────────
    // Normal post return
    // ─────────────────────────────
    return {
      status: 1,
      message: "Post created successfully",
      data: newPost,
    };
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      status: 0,
      message: "Internal server error while creating post",
    };
  }
}
