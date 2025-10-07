import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// Helper: fetch comment with its author's userId
async function getCommentWithAuthorUserId(commentId: number) {
  const row = await db.query.comments.findFirst({
    where: (c, { eq }) => eq(c.id, commentId),
    with: {
      authorProfile: true, // includes authorProfile.userId
    },
  });
  return row;
}

// ======================
// 🟡 PATCH (Edit comment) — author only
// ======================
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const commentId = Number(params.id);
    if (Number.isNaN(commentId)) {
      return NextResponse.json({ error: "Invalid comment id" }, { status: 400 });
    }

    const { content } = await req.json();
    if (!content) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    const existing = await getCommentWithAuthorUserId(commentId);
    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const currentUserId = Number(session.user.id);
    const isAuthor = Number(existing.authorProfile?.userId) === currentUserId;

    if (!isAuthor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.update(comments).set({ content, status: "EDITED" }).where(eq(comments.id, commentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comment PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
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
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const commentId = Number(params.id);
    if (Number.isNaN(commentId)) {
      return NextResponse.json({ error: "Invalid comment id" }, { status: 400 });
    }

    const existing = await getCommentWithAuthorUserId(commentId);
    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const currentUserId = Number(session.user.id);
    const isAuthor = Number(existing.authorProfile?.userId) === currentUserId;
    const isAdmin =
      ((session.user as any)?.role ?? "").toString().toUpperCase() === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete: mask content and set status
    await db
      .update(comments)
      .set({ content: "[deleted]", status: "DELETED" })
      .where(eq(comments.id, commentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comment DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
