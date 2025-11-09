import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { getPostsDataInclude } from "@/types/types";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params;
  const loggedInUser = await getUser(req);

  const postIdNum = Number(postId);
  if (!Number.isFinite(postIdNum)) {
    return NextResponse.json(
      { status: 0, message: "Invalid post id" },
      { status: 400 }
   );
 }


  try {
    const post = await prisma.post.findFirst({
      where: {
        id: postIdNum,
        status: "PUBLISHED",
      },
      include: {
        ...getPostsDataInclude(
          loggedInUser ? Number(loggedInUser.defaultProfileId) : null
        ),
        _count: {
          select: { comments: true, votes: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { status: 0, message: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { status: 1, message: "Post fetched successfully", data: post },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Post GET error:", error);
    return NextResponse.json(
      { status: 0, message: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
