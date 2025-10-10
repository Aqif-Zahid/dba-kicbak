import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getCurrentUserId } from "@/helpers/get-current-user-id";
import { getUser } from "@/lib/auth";

// Helper: build nested comment tree
function buildCommentTree(all: any[]) {
  const byId = new Map<number, any>();
  const roots: any[] = [];

  all.forEach((c) => byId.set(c.id, { ...c, replies: [] }));

  all.forEach((c) => {
    const node = byId.get(c.id);
    if (c.parentId) {
      const parent = byId.get(c.parentId);
      if (parent) parent.replies.push(node);
      else roots.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortRecursively = (arr: any[]) => {
    arr.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    arr.forEach((n) => sortRecursively(n.replies));
  };
  sortRecursively(roots);

  return roots;
}

// ===============================
// GET comments
// ===============================
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const postId = Number(url.searchParams.get("postId"));
    if (!postId) {
      return NextResponse.json(
        { status: 0, message: "postId is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const currentUserId = getCurrentUserId(session);

    const rows = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: {
        authorProfile: true,
        votes: true,
      },
    });

    const flat = rows.map((c) => {
      const deleted = c.status === "DELETED";
      const upvotes = c.votes.filter((v) => v.voteType === "UPVOTE").length;
      const downvotes = c.votes.filter((v) => v.voteType === "DOWNVOTE").length;
      const userVote =
        currentUserId != null
          ? c.votes.find((v) => Number(v.userId) === currentUserId)?.voteType ??
            null
          : null;

      return {
        id: c.id,
        content: deleted ? "[deleted]" : c.content,
        createdAt: c.createdAt,
        parentId: c.parentId,
        authorDisplayName: deleted
          ? "[deleted user]"
          : c.authorProfile?.displayName ?? "User",
        authorProfileId: c.authorProfileId,
        upvotes,
        downvotes,
        userVote,
        status: c.status,
        isDeleted: deleted,
      };
    });

    const nested = buildCommentTree(flat);
    return NextResponse.json({ status: 1, comments: nested });
  } catch (error) {
    console.error("Comments GET error:", error);
    return NextResponse.json(
      { status: 0, message: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// ===============================
// POST comment
// ===============================
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );

    const userId = Number(session.user.id);
    const { postId, content, parentId } = await req.json();

    if (!postId || !content) {
      return NextResponse.json(
        { status: 0, message: "Invalid data (postId and content required)" },
        { status: 400 }
      );
    }

    const profile = await prisma.profiles.findFirst({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(
        { status: 0, message: "Profile not found" },
        { status: 404 }
      );
    }

    const inserted = await prisma.comment.create({
      data: {
        postId,
        content,
        authorProfileId: profile.id,
        parentId: parentId ?? null,
        status: "VISIBLE",
      },
    });

    return NextResponse.json({ success: true, comment: inserted });
  } catch (error) {
    console.error("Comment POST error:", error);
    return NextResponse.json(
      { status: 0, message: "Failed to create comment" },
      { status: 500 }
    );
  }
}

// ===============================
// PATCH comment (edit or soft-delete)
// ===============================
export async function PATCH(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) {
      return NextResponse.json(
        { status: 0, message: "User Unauthorized!" },
        { status: 401 }
      );
    }

    const { commentId, content, status } = await req.json();
    if (!commentId) {
      return NextResponse.json(
        { status: 0, message: "Invalid data" },
        { status: 400 }
      );
    }

    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { authorProfile: true },
    });

    if (!existing)
      return NextResponse.json(
        { status: 0, message: "Comment not found" },
        { status: 404 }
      );

    const currentUserId = user.id;
    const isAuthor = existing.authorProfile?.userId === currentUserId;
    const isAdmin = user.role?.toString().toUpperCase() === "ADMIN";

    if (status === "DELETED") {
      if (!isAuthor && !isAdmin) {
        return NextResponse.json(
          { status: 0, message: "Forbidden" },
          { status: 403 }
        );
      }

      await prisma.comment.update({
        where: { id: commentId },
        data: { status: "DELETED", content: "[deleted]" },
      });

      return NextResponse.json({ status: 1, message: "Deleted Successfully" });
    }

    if (!content) {
      return NextResponse.json(
        { status: 0, message: "Content required for edit" },
        { status: 400 }
      );
    }

    if (!isAuthor) {
      return NextResponse.json(
        { status: 0, message: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { content, status: "EDITED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comment PATCH error:", error);
    return NextResponse.json(
      { status: 0, message: "Failed to update comment" },
      { status: 500 }
    );
  }
}

// ===============================
// DELETE comment (soft delete)
// ===============================
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) {
      return NextResponse.json(
        { status: 0, message: "User Unauthorized!" },
        { status: 401 }
      );
    }
    const url = new URL(req.url);
    const commentId = Number(url.searchParams.get("id"));
    if (!commentId)
      return NextResponse.json(
        { status: 0, message: "Missing id" },
        { status: 400 }
      );

    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { authorProfile: true },
    });

    if (!existing)
      return NextResponse.json(
        { status: 0, message: "Comment not found" },
        { status: 404 }
      );

    const currentUserId = user.id;
    const isAuthor = existing.authorProfile?.userId === currentUserId;
    const isAdmin = user.role?.toString().toUpperCase() === "ADMIN";

    if (!isAuthor && !isAdmin)
      return NextResponse.json(
        { status: 0, message: "Forbidden" },
        { status: 403 }
      );

    await prisma.comment.update({
      where: { id: commentId },
      data: { status: "DELETED", content: "[deleted]" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comment DELETE error:", error);
    return NextResponse.json(
      { status: 0, message: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
