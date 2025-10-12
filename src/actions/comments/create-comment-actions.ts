"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { getCommentDataInclude, Post } from "@/types/types";

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
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const { content: contentValidated } = createCommentSchema.parse({ content });

  const [newComment] = await prisma.$transaction([
    prisma.comment.create({
      data: {
        content: contentValidated,
        postId: post.id,
        userId: user.id,
      },
      include: getCommentDataInclude(user.id),
    }),
    //Notifications
    ...(post.user.id !== user.id
      ? [
          prisma.notification.create({
            data: {
              issuerId: user.id,
              recipientId: post.user.id,
              type: "COMMENT",
              postId: post.id,
            },
          }),
        ]
      : []),
  ]);

  return newComment;
}
