import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, communityId } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 });
    }

    // Get profile for logged-in user
    const profile = await db.query.profiles.findFirst({
      where: eq(posts.authorProfileId, Number(session.user.id)), // adjust to match your schema
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const newPost = await db
      .insert(posts)
      .values({
        authorProfileId: profile.id,
        communityId: communityId || 1, // default to 1 if you don’t have multiple yet
        title,
        content,
        status: "PUBLISHED",
      })
      .returning();

    return NextResponse.json({ success: true, post: newPost[0] });
  } catch (err) {
    console.error("Create post error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
