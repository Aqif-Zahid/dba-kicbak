import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getCurrentUserId } from "@/helpers/get-current-user-id";

// === Helper: Build nested comment tree ===
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
    } else roots.push(node);
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

// ======================
//  GET Single Post
// ======================
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const postId = Number(id);
  if (Number.isNaN(postId))
    return NextResponse.json(
      { status: 0, message: "Invalid post id" },
      { status: 400 }
    );

  try {
    const session = await getServerSession(authOptions);
    const currentUserId = getCurrentUserId(session);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        authorProfile: true,
        votes: true,
        comments: {
          include: {
            authorProfile: true,
            votes: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!post)
      return NextResponse.json(
        { status: 0, message: "Post not found" },
        { status: 404 }
      );

    const isDeleted = post.status === "DELETED";

    // Map comments
    const mappedComments = post.comments.map((c) => {
      const deleted = c.status === "DELETED";
      const upvotes = c.votes.filter((v) => v.voteType === "UPVOTE").length;
      const downvotes = c.votes.filter((v) => v.voteType === "DOWNVOTE").length;
      const userVote =
        currentUserId != null
          ? c.votes.find((v) => v.userId === currentUserId)?.voteType ?? null
          : null;

      return {
        id: c.id,
        content: deleted ? "[deleted]" : c.content,
        createdAt: c.createdAt,
        parentId: c.parentId,
        authorDisplayName: deleted
          ? "[deleted user]"
          : c.authorProfile?.displayName ?? "User",
        authorUserId: c.authorProfile?.userId ?? null,
        upvotes,
        downvotes,
        userVote,
        isDeleted: deleted,
      };
    });

    const nestedComments = buildCommentTree(mappedComments);

    const postUpvotes = post.votes.filter(
      (v) => v.voteType === "UPVOTE"
    ).length;
    const postDownvotes = post.votes.filter(
      (v) => v.voteType === "DOWNVOTE"
    ).length;
    const postUserVote =
      currentUserId != null
        ? post.votes.find((v) => v.userId === currentUserId)?.voteType ?? null
        : null;

    return NextResponse.json({
      post: {
        id: post.id,
        title: isDeleted ? "[deleted]" : post.title,
        content: isDeleted ? "[deleted]" : post.content,
        createdAt: post.createdAt,
        authorDisplayName: isDeleted
          ? "[deleted user]"
          : post.authorProfile?.displayName ?? "User",
        authorProfileId: post.authorProfileId,
        upvotes: postUpvotes,
        downvotes: postDownvotes,
        userVote: postUserVote,
        status: post.status,
        comments: nestedComments,
        isDeleted,
      },
    });
  } catch (error: any) {
    console.error("Post GET error:", error);
    return NextResponse.json(
      { status: 0, message: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// ======================
//  PATCH (Edit post)
// ======================
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const postId = Number(id);

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );

    const body = await req.json();
    const { title, content, status } = body;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { authorProfile: true },
    });

    if (!post)
      return NextResponse.json(
        { status: 0, message: "Post not found" },
        { status: 404 }
      );

    const currentUserId = getCurrentUserId(session);
    const isAuthor = post.authorProfile?.userId === currentUserId;
    const isAdmin = (session.user as any)?.role?.toUpperCase() === "ADMIN";

    if (!isAuthor && !isAdmin)
      return NextResponse.json(
        { status: 0, message: "Forbidden" },
        { status: 403 }
      );

    await prisma.post.update({
      where: { id: postId },
      data: {
        ...(title ? { title } : {}),
        ...(content ? { content } : {}),
        ...(status ? { status } : {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Post PATCH error:", error);
    return NextResponse.json(
      { status: 0, message: "Failed to update post" },
      { status: 500 }
    );
  }
}

// ======================
//  DELETE (Soft delete)
// ======================
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const postId = Number(id);

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { authorProfile: true },
    });

    if (!post)
      return NextResponse.json(
        { status: 0, message: "Post not found" },
        { status: 404 }
      );

    const currentUserId = getCurrentUserId(session);
    const isAuthor = post.authorProfile?.userId === currentUserId;
    const isAdmin = (session.user as any)?.role?.toUpperCase() === "ADMIN";

    if (!isAuthor && !isAdmin)
      return NextResponse.json(
        { status: 0, message: "Forbidden" },
        { status: 403 }
      );

    await prisma.post.update({
      where: { id: postId },
      data: { status: "DELETED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Post DELETE error:", error);
    return NextResponse.json(
      { status: 0, message: "Failed to delete post" },
      { status: 500 }
    );
  }
}
