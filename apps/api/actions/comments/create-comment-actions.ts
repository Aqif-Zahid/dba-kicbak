"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { getCommentDataInclude, Post } from "@/types/types";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCurrentProfileId } from "@/helpers/get-current-user-id";

export async function submitComment({
  post,
  content,
}: {
  post: Post;
  content: string;
}) {
  const createCommentSchema = z.object({
    content: z.string().trim().min(1, "Content is required"),
  });

  const session = await getServerSession(authOptions);
  const profileId = getCurrentProfileId(session);

  if (!session?.user || !profileId) {
    throw new Error("Unauthorized");
  }

  const { content: contentValidated } = createCommentSchema.parse({ content });

  // New: check if comments are allowed on this post
  const postData = await prisma.post.findUnique({
    where: { id: post.id },
    select: { allowComments: true },
  });

  if (!postData) {
    throw new Error("Post not found");
  }

  if (!postData.allowComments) {
    throw new Error("Comments are disabled for this post");
  }

  // Proceed with transaction only after validation passes
  const [newComment] = await prisma.$transaction([
    prisma.comment.create({
      data: {
        content: contentValidated,
        postId: post.id,
        authorProfileId: profileId,
      },
      include: getCommentDataInclude(profileId),
    }),
    ...(post.authorProfile.id !== profileId
      ? [
          prisma.notification.create({
            data: {
              issuerId: profileId,
              recipientId: post.authorProfile.id,
              type: "COMMENT",
              postId: post.id,
            },
          }),
        ]
      : []),
  ]);

  return newComment;
}
