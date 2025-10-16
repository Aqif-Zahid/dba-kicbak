"use server";
import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCurrentProfileId } from "@/helpers/get-current-user-id";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { getPostsDataInclude } from "@/types/types";

const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(3, "Content must be at least 3 characters"),
  communityId: z.number().optional(),
  mediaIds: z.array(z.string()).max(5, "Cannot have more than 5 attachments"),
});

export async function createPost(input: {
  content: string;
  title: string;
  mediaIds: string[];
}) {
  const session = await getServerSession(authOptions);
  const currentProfileId = getCurrentProfileId(session);
  if (!currentProfileId) {
    throw new Error("Unauthorized");
  }

  const { title, content, communityId, mediaIds } =
    createPostSchema.parse(input);

  let selectedCommunityId: number;
  if (communityId) {
    selectedCommunityId = Number(communityId);
  } else {
    let generalCommunity = await prisma.community.findFirst({
      where: { slug: "general" },
    });
    if (!generalCommunity) {
      generalCommunity = await prisma.community.create({
        data: {
          name: "General",
          slug: "general",
          description: "Default community for general discussions",
          ownerId: Number(currentProfileId),
        },
      });
    }

    selectedCommunityId = generalCommunity.id;
  }
  const newPost = await prisma.post.create({
    data: {
      title,
      content,
      authorProfileId: currentProfileId,
      communityId: selectedCommunityId,
      attachment: {
        connect: mediaIds.map((id) => ({ id })),
      },
      status: "PUBLISHED",
    },
    include: getPostsDataInclude(currentProfileId),
  });
  return newPost;
}
