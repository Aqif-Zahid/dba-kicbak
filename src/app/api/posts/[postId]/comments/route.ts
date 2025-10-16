import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CommentsPage, getCommentDataInclude } from "@/types/types";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params; // Destructure inside

    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 5;

    const user = await getUser(req);

    if (!user) {
      return Response.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { postId: Number(postId) },
      include: getCommentDataInclude(Number(user.id)),
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

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
