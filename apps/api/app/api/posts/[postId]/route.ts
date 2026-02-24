import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { getPostsDataInclude } from "@/types/types";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params;
  const loggedInUser = await getUser(req);

  const postIdNum = Number(postId);
  if (!Number.isFinite(postIdNum)) {
    return NextResponse.json(
      { status: 0, message: "Invalid post id" },
      { status: 400 }
    );
  }

  try {
    const post = await prisma.post.findFirst({
      where: {
        id: postIdNum,
        status: "PUBLISHED", // don't show deleted/archived here
      },
      include: {
        ...getPostsDataInclude(
          loggedInUser ? Number((loggedInUser as any).defaultProfileId) : null
        ),
        _count: {
          select: { comments: true, votes: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { status: 0, message: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { status: 1, message: "Post fetched successfully", data: post },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Post GET error:", error);
    return NextResponse.json(
      { status: 0, message: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params;

  const postIdNum = Number(postId);
  if (!Number.isFinite(postIdNum)) {
    return NextResponse.json(
      { status: 0, message: "Invalid post id" },
      { status: 400 }
    );
  }

  try {
    const user = await getUser(req);

    if (!user) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentProfileId = Number((user as any).defaultProfileId);
    const isAdmin = (user as any).role === "ADMIN";

    // fetch minimal info we need for auth + redirect + cache updates
    const post = await prisma.post.findUnique({
      where: { id: postIdNum },
      select: {
        id: true,
        authorProfileId: true,
        authorProfile: { select: { username: true } },
        status: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { status: 0, message: "Post not found" },
        { status: 404 }
      );
    }

    if (!isAdmin && post.authorProfileId !== currentProfileId) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // soft delete (prevents FK/relational delete failures)
    await prisma.post.update({
      where: { id: postIdNum },
      data: { status: "DELETED" },
    });

    // return the exact data your frontend needs
    return NextResponse.json(
      {
        status: 1,
        message: "Post deleted successfully",
        data: {
          id: post.id,
          authorProfile: { username: post.authorProfile?.username ?? "home" },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Post DELETE error:", error);
    return NextResponse.json(
      { status: 0, message: error?.message || "Failed to delete post" },
      { status: 500 }
    );
  }
}
