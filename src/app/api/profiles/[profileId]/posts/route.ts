import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPostsDataInclude, PostsPage } from "@/types/types";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await context.params;
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;
    const user = await getUser(req);
    if (!user) {
      return Response.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const posts = await prisma.post.findMany({
      where: { authorProfileId: Number(profileId) },
      include: getPostsDataInclude(Number(profileId)),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: Number(cursor) } : undefined,
    });
    const nextCursor =
      posts.length > pageSize ? String(posts[pageSize].id) : null;
    const data: PostsPage = { posts: posts.slice(0, pageSize), nextCursor };

    return Response.json(data);
  } catch (err) {
    console.log(err);
    return Response.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
