import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CommentsPage, getCommentDataInclude } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ---------- GET: fetch comments (always visible even if comments are disabled) ----------
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;

    const postIdNum = Number(postId);
    if (!Number.isFinite(postIdNum)) {
      return NextResponse.json(
        { status: 0, message: "Invalid post id" },
        { status: 400 }
      );
    }

    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 5;

    const user = await getUser(req);

    // Fetch allowComments so UI can hide composer but still show existing comments
    const post = await prisma.post.findUnique({
      where: { id: postIdNum },
      select: { allowComments: true },
    });

    const comments = await prisma.comment.findMany({
      where: { postId: postIdNum },
      include: getCommentDataInclude(user ? Number(user.defaultProfileId) : null),
      orderBy: { createdAt: "asc" },
      take: -pageSize - 1,
      cursor: cursor ? { id: Number(cursor) } : undefined,
    });

    const previousCursor =
      comments.length > pageSize ? String(comments[0].id) : null;

    const data: CommentsPage = {
      comments: comments.length > pageSize ? comments.slice(1) : comments,
      previousCursor,
    };

    return NextResponse.json({
      status: 1,
      data,
      commentsDisabled: post ? !post.allowComments : false,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------- POST: create a comment (blocked if comments disabled) ----------
const CreateCommentSchema = z.object({
  content: z.string().trim().min(1, "Content is required"),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;

    const loggedInUser = await getUser(req);
    if (!loggedInUser) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const postIdNum = Number(postId);
    if (!Number.isFinite(postIdNum)) {
      return NextResponse.json(
        { status: 0, message: "Invalid post id" },
        { status: 400 }
      );
    }

    const json = await req.json().catch(() => ({}));
    const parsed = CreateCommentSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { status: 0, message: "Invalid input", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { content } = parsed.data;

    const post = await prisma.post.findUnique({
      where: { id: postIdNum },
      select: { allowComments: true },
    });

    if (!post) {
      return NextResponse.json(
        { status: 0, message: "Post not found" },
        { status: 404 }
      );
    }

    if (!post.allowComments) {
      return NextResponse.json(
        { status: 0, message: "Comments are disabled for this post" },
        { status: 403 }
      );
    }

    const created = await prisma.comment.create({
      data: {
        content,
        postId: postIdNum,
        authorProfileId: Number(loggedInUser.defaultProfileId),
      },
      include: getCommentDataInclude(Number(loggedInUser.defaultProfileId)),
    });

    return NextResponse.json(
      { status: 1, message: "Comment posted successfully", data: created },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
