import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPostsDataInclude, PostsPage } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    const user = await getUser(req);
    if (!user) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        profileId: Number(user.defaultProfileId),
        post: {
          status: "PUBLISHED",
        },
      },
      include: {
        post: {
          include: getPostsDataInclude(Number(user.defaultProfileId)),
        },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const hasMore = bookmarks.length > pageSize;
    const data: PostsPage = {
      posts: hasMore ? bookmarks.slice(0, pageSize).map((b) => b.post) : bookmarks.map((b) => b.post),
      nextCursor: hasMore ? bookmarks[pageSize - 1].id : null,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Bookmarks route error:", err);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
