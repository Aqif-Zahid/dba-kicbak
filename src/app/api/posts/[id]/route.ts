import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = Number(params.id);
    if (Number.isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const result = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        authorDisplayName: profiles.displayName,
      })
      .from(posts)
      .leftJoin(profiles, eq(posts.authorProfileId, profiles.id))
      .where(eq(posts.id, postId))
      .limit(1);

    if (!result[0]) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post: result[0] });
  } catch (err) {
    console.error("Fetch post by id error:", err);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}
