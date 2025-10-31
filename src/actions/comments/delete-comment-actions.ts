"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { getCurrentProfileId } from "@/helpers/get-current-user-id";
import prisma from "@/lib/prisma";
import { getCommentDataInclude } from "@/types/types";

export async function deleteComment(id: number) {
  const session = await getServerSession(authOptions);
  const profileId = getCurrentProfileId(session);

  if (!session?.user) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) throw new Error("Comment not found");
  if (comment.authorProfileId !== profileId) throw new Error("Unauthorized");

  // soft delete
  const deletedComment = await prisma.comment.update({
    where: { id },
    data: {
      status: "DELETED",
      content: "[deleted]",
    },
    include: getCommentDataInclude(profileId),
  });

  return deletedComment;
}
