import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getPostsDataInclude, PostsPage } from "@/types/types";
import { getUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;
    const user = await getUser(req);

    const posts = await prisma.post.findMany({
      include: getPostsDataInclude(user ? Number(user.defaultProfileId) : null),
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
