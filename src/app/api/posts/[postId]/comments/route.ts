import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CommentsPage, getCommentDataInclude } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ===============================
// GET: Fetch latest 9 comments (auto on post open)
// ===============================
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
    const pageSize = 9; // ⬅️ show 9 latest comments on initial load
    const user = await getUser(req);

    // Fetch post info for comment availability
    const post = await prisma.post.findUnique({
      where: { id: postIdNum },
      select: { allowComments: true },
    });

    // Fetch latest comments (pinned first, then recent)
    const allComments = await prisma.comment.findMany({
      where: { postId: postIdNum },
      include: getCommentDataInclude(
        user ? Number(user.defaultProfileId) : null,
        true
      ),
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" }, // ⬅️ show newest first
      ],
      take: pageSize + 1, // fetch one extra for pagination
      ...(cursor && { cursor: { id: Number(cursor) }, skip: 1 }),
    });

    const hasMore = allComments.length > pageSize;
    const visibleComments = hasMore
      ? allComments.slice(0, pageSize)
      : allComments;

    const previousCursor = hasMore
      ? String(visibleComments[visibleComments.length - 1].id)
      : null;

    // Split pinned comment (if any)
    const pinnedComment = visibleComments.find((c) => c.isPinned);
    const normalComments = visibleComments.filter((c) => !c.isPinned);

    const data: CommentsPage = {
      comments: [
        ...(pinnedComment ? [pinnedComment] : []),
        ...normalComments,
      ],
      previousCursor,
    };

    return NextResponse.json({
      status: 1,
      data,
      commentsDisabled: post ? !post.allowComments : false,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// ===============================
// POST: Create a comment
// ===============================
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
        {
          status: 0,
          message: "Invalid input",
          errors: parsed.error.flatten(),
        },
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
      include: getCommentDataInclude(Number(loggedInUser.defaultProfileId), true),
    });

    return NextResponse.json(
      { status: 1, message: "Comment posted successfully", data: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
