import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getCurrentUserId } from "@/helpers/get-current-user-id";

// ======================
// Helper: fetch session & comment
// ======================
async function getSessionAndComment(commentId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: { message: "Unauthorized", status: 0 } };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { authorProfile: true },
  });

  if (!comment) {
    return { error: { message: "Comment not found", status: 0 } };
  }

  return { session, comment };
}

// ======================
// 🟡 PATCH (Edit comment) — author only
// ======================
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = Number(params.id);
    if (Number.isNaN(commentId)) {
      return NextResponse.json(
        { message: "Invalid comment id", status: 0 },
        { status: 400 }
      );
    }

    const { content } = await req.json();
    if (!content) {
      return NextResponse.json(
        { message: "Content required", status: 0 },
        { status: 400 }
      );
    }

    const { session, comment, error } = await getSessionAndComment(commentId);
    if (error) return NextResponse.json(error, { status: 401 });

    const currentUserId = getCurrentUserId(session);
    const isAuthor = Number(comment.authorProfile?.userId) === currentUserId;

    if (!isAuthor) {
      return NextResponse.json(
        { message: "Forbidden", status: 0 },
        { status: 403 }
      );
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { content, status: "EDITED" },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Comment PATCH error:", err);
    return NextResponse.json(
      { message: "Failed to update comment", status: 0 },
      { status: 500 }
    );
  }
}

// ======================
// 🔴 DELETE (Soft delete) — author or ADMIN
// ======================
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = Number(params.id);
    if (Number.isNaN(commentId)) {
      return NextResponse.json(
        { message: "Invalid comment id", status: 0 },
        { status: 400 }
      );
    }

    const { session, comment, error } = await getSessionAndComment(commentId);
    if (error) return NextResponse.json(error, { status: 401 });

    const currentUserId = getCurrentUserId(session);
    const isAuthor = Number(comment.authorProfile?.userId) === currentUserId;
    const isAdmin =
      ((session.user as any)?.role ?? "").toString().toUpperCase() === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { message: "Forbidden", status: 0 },
        { status: 403 }
      );
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { content: "[deleted]", status: "DELETED" },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Comment DELETE error:", err);
    return NextResponse.json(
      { message: "Failed to delete comment", status: 0 },
      { status: 500 }
    );
  }
}
