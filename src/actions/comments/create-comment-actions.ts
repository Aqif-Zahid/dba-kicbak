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

  const [newComment] = await prisma.$transaction([
    prisma.comment.create({
      data: {
        content: contentValidated,
        postId: post.id,
        authorProfileId: profileId,
      },
      include: getCommentDataInclude(profileId),
    }),
    //Notifications
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
