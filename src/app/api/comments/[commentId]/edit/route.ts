import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const user = await getUser(req);
    if (!user) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: No active session" },
        { status: 401 }
      );
    }

    const commentId = Number(params.commentId);
    const body = await req.json();
    const { content } = body;

    if (!content || content.trim().length < 1) {
      return NextResponse.json(
        { status: 0, message: "Comment content cannot be empty" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { authorProfile: true },
    });

    if (!comment) {
      return NextResponse.json(
        { status: 0, message: "Comment not found" },
        { status: 404 }
      );
    }

    if (comment.authorProfileId !== user.defaultProfileId) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: Cannot edit this comment" },
        { status: 403 }
     );
    }


    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
        edited: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        status: 1,
        message: "Comment updated successfully",
        data: updatedComment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error editing comment:", error);
    return NextResponse.json(
      { status: 0, message: "Failed to edit comment" },
      { status: 500 }
    );
  }
}
