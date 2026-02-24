import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPostsDataInclude, PostsPage } from "@/types/types";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") || "";
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const searchQuery = q.split(" ").join(" & ");

    const pageSize = 10;

    const user = await getUser(req);
    if (!user) {
      return Response.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { content: { search: searchQuery } },
          { authorProfile: { displayName: { search: searchQuery } } },
          { authorProfile: { username: { search: searchQuery } } },
        ],
      },
      include: getPostsDataInclude(Number(user.defaultProfileId)),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: Number(cursor) } : undefined,
    });

    const nextCursor =
      posts.length > pageSize ? String(posts[pageSize].id) : null;
    const data: PostsPage = { posts: posts.slice(0, pageSize), nextCursor };

    return NextResponse.json(data);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
