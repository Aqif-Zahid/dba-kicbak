"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCurrentProfileId } from "@/helpers/get-current-user-id";
import prisma from "@/lib/prisma";
import { getPostsDataInclude } from "@/types/types";
import { getServerSession } from "next-auth";

export async function deletePost(id: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const currentProfileId = getCurrentProfileId(session);

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      authorProfileId: true,
      status: true,
    },
  });

  if (!post) throw new Error("Post not found");
  if (post.authorProfileId !== currentProfileId) throw new Error("Unauthorized");

  // Soft delete instead of hard delete
  const deletedPost = await prisma.post.update({
    where: { id },
    data: {
      status: "DELETED",
      content: "[deleted]",
      title: "[deleted]",
    },
    include: getPostsDataInclude(currentProfileId),
  });

  return deletedPost;
}
