"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCurrentProfileId } from "@/helpers/get-current-user-id";
import prisma from "@/lib/prisma";
import { getCommentDataInclude } from "@/types/types";
import { getServerSession } from "next-auth";

export async function deleteComment(id: number) {
  const session = await getServerSession(authOptions);
  const profileId = getCurrentProfileId(session);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const comment = await prisma.comment.findUnique({
    where: { id },
  });
  if (!comment) {
    throw new Error("Comment not found");
  }
  if (comment.authorProfileId !== profileId) {
    throw new Error("Unauthorized");
  }
  const deletedComment = await prisma.comment.delete({
    where: { id },
    include: getCommentDataInclude(profileId),
  });
  return deletedComment;
}
