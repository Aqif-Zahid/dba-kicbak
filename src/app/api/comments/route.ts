import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comments } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

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
//  GET comments
// ===============================
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const postId = Number(url.searchParams.get("postId"));
    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id ? Number(session.user.id) : null;

    const rows = await db.query.comments.findMany({
      where: eq(comments.postId, postId),
      orderBy: [asc(comments.createdAt)],
      with: {
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
          ? c.votes.find((v) => Number(v.userId) === currentUserId)?.voteType ?? null
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

    return NextResponse.json({ comments: nested });
  } catch (error) {
    console.error("Comments GET error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// ===============================
//  POST comment
// ===============================
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = Number(session.user.id);
    const body = await req.json();
    const { postId, content, parentId } = body || {};

    if (!postId || !content) {
      return NextResponse.json(
        { error: "Invalid data (postId and content required)" },
        { status: 400 }
      );
    }

    const profile = await db.query.profiles.findFirst({
      where: (p, { eq }) => eq(p.userId, userId),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const inserted = await db
      .insert(comments)
      .values({
        postId: Number(postId),
        content: String(content),
        authorProfileId: profile.id,
        parentId: parentId ?? null,
        status: "VISIBLE",
      })
      .returning();

    return NextResponse.json({ success: true, comment: inserted[0] });
  } catch (error) {
    console.error("Comment POST error:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}

// ===============================
//  PATCH (edit OR soft-delete comment)
//  - If `content` provided: author can edit; status becomes "EDITED"
//  - If `status: "DELETED"` provided: author or admin can soft-delete; content masked
// ===============================
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { commentId, content, status } = body || {};
    if (!commentId) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const existing = await db.query.comments.findFirst({
      where: eq(comments.id, Number(commentId)),
      with: { authorProfile: true },
    });

    if (!existing)
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    const currentUserId = Number(session.user.id);
    const isAuthor = Number(existing.authorProfile?.userId) === currentUserId;
    const isAdmin =
      ((session.user as any)?.role ?? "").toString().toUpperCase() === "ADMIN";

    // Handle delete via PATCH
    if (status === "DELETED") {
      if (!isAuthor && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await db
        .update(comments)
        .set({ status: "DELETED", content: "[deleted]" })
        .where(eq(comments.id, Number(commentId)));

      return NextResponse.json({ success: true });
    }

    // Handle edit via PATCH
    if (!content) {
      return NextResponse.json({ error: "Content required for edit" }, { status: 400 });
    }

    if (!isAuthor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db
      .update(comments)
      .set({ content, status: "EDITED" })
      .where(eq(comments.id, Number(commentId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comment PATCH error:", error);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

// ===============================
//  DELETE (soft delete comment) — author or admin
//  (kept as-is; supports ?id= param)
// ===============================
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const commentId = Number(url.searchParams.get("id"));
    if (!commentId)
      return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const existing = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
      with: { authorProfile: true },
    });

    if (!existing)
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    const currentUserId = Number(session.user.id);
    const isAuthor = Number(existing.authorProfile?.userId) === currentUserId;
    const isAdmin =
      ((session.user as any)?.role ?? "").toString().toUpperCase() === "ADMIN";

    if (!isAuthor && !isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await db
      .update(comments)
      .set({ status: "DELETED", content: "[deleted]" })
      .where(eq(comments.id, commentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comment DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
