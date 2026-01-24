import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { getPostsDataInclude } from "@/types/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const user = await getUser(req);

    if (!user)
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );

    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
      select: { authorProfileId: true, allowComments: true, hasBestAnswer: true },
    });

    if (!post)
      return NextResponse.json(
        { status: 0, message: "Post not found" },
        { status: 404 }
      );

    if (post.authorProfileId !== user.defaultProfileId)
      return NextResponse.json(
        { status: 0, message: "Forbidden: Not your post" },
        { status: 403 }
      );

    // Prevent enabling comments after marking best answer
    if (post.hasBestAnswer && !post.allowComments) {
      return NextResponse.json(
        {
          status: 0,
          message:
            "You cannot re-enable comments after marking a Best Answer. Unmark it first.",
        },
        { status: 403 }
      );
    }

    const updated = await prisma.post.update({
      where: { id: Number(postId) },
      data: { allowComments: !post.allowComments },
      include: getPostsDataInclude(user.defaultProfileId),
    });

    return NextResponse.json({
      status: 1,
      message: `Comments have been ${updated.allowComments ? "enabled" : "disabled"}.`,
      data: updated,
    });
  } catch (error) {
    console.error("Toggle comments error:", error);
    return NextResponse.json(
      { status: 0, message: "Failed to toggle comments" },
      { status: 500 }
    );
  }
}
