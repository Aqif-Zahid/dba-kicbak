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
      where: { status: "PUBLISHED" },
      include: getPostsDataInclude(
        user ? Number(user.defaultProfileId) : null
      ),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: Number(cursor) } : undefined,
    });

    const hasMore = posts.length > pageSize;
    const data: PostsPage = {
      posts: hasMore ? posts.slice(0, pageSize) : posts,
      nextCursor: hasMore ? String(posts[pageSize - 1].id) : null,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("ForYouFeed error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
