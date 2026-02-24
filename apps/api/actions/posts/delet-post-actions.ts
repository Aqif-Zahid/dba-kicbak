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

  // Soft delete while preserving original title and content in DB
  const deletedPost = await prisma.post.update({
    where: { id },
    data: {
      status: "DELETED",
    },
    include: getPostsDataInclude(currentProfileId),
  });

  // Mask deleted post’s data at the API layer if returned
  //    (in case filters ever fail or are bypassed)
  const maskedPost = {
    ...deletedPost,
    title: "[Deleted]",
    content: "[Deleted]",
  };

  return maskedPost;
}
