"use server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getPostsDataInclude } from "@/types/types";
import { getServerSession } from "next-auth";

export async function deletePost(id: number) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: { message: "Unauthorized", status: 0 } };
  }
  const userId = (session.user as any).id;

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    throw new Error("Post not found");
  }
  if (post.authorProfileId !== userId) {
    throw new Error("Unauthorized");
  }
  const deletePost = await prisma.post.delete({
    where: { id },
    include: getPostsDataInclude(userId),
  });

  return deletePost;
}
