import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export const POST = async (
  req: NextRequest,
  { params }: { params: { postId: string } }
) => {
  try {
    const user = await getUser(req);
    if (!user || !user.defaultProfileId) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: No active session" },
        { status: 401 }
      );
    }

    const { commentId, unpin } = await req.json();
    const postId = Number(params.postId);
    const profileId = Number(user.defaultProfileId);

    if (!commentId || isNaN(postId)) {
      return NextResponse.json(
        { status: 0, message: "Invalid request parameters" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        type: true,
        authorProfileId: true,
        hasBestAnswer: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { status: 0, message: "Post not found" },
        { status: 404 }
      );
    }

    if (post.authorProfileId !== profileId) {
      return NextResponse.json(
        { status: 0, message: "Forbidden: You are not the post author" },
        { status: 403 }
      );
    }

    if (unpin) {
      // Unpin comment
      await prisma.comment.update({
        where: { id: Number(commentId) },
        data: { isPinned: false },
      });

      // Reset post fields if Question type
      if (post.type === "QUESTION") {
        await prisma.post.update({
          where: { id: postId },
          data: { hasBestAnswer: false, allowComments: true },
        });
        return NextResponse.json(
          { status: 1, message: "Best Answer unmarked successfully" },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { status: 1, message: "Comment unpinned successfully" },
        { status: 200 }
      );
    }

    // Pin comment
    await prisma.comment.updateMany({
      where: { postId, isPinned: true },
      data: { isPinned: false },
    });

    await prisma.comment.update({
      where: { id: Number(commentId) },
      data: { isPinned: true },
    });

    if (post.type === "QUESTION") {
      await prisma.post.update({
        where: { id: postId },
        data: { hasBestAnswer: true, allowComments: false },
      });
      return NextResponse.json(
        { status: 1, message: "Marked as Best Answer successfully" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { status: 1, message: "Comment pinned successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in pin comment route:", err);
    return NextResponse.json(
      { status: 0, message: "Failed to pin comment" },
      { status: 500 }
    );
  }
};
