import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, profiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// ===============================
// 🟢 CREATE POST
// ===============================
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content required" },
        { status: 400 }
      );
    }

    // ✅ Find the user's profile
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, Number(session.user.id)))
      .limit(1);

    if (!profile || profile.length === 0) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // ✅ Create post (no community constraint for now)
    const newPost = await db
      .insert(posts)
      .values({
        authorProfileId: profile[0].id,
        communityId: 1, // default or dummy community for now
        title,
        content,
        status: "PUBLISHED",
      })
      .returning();

    return NextResponse.json({ success: true, post: newPost[0] });
  } catch (err) {
    console.error("Create post error:", err);
    return NextResponse.json(
      { error: "Something went wrong while creating the post" },
      { status: 500 }
    );
  }
}

// ===============================
// 🔵 GET ALL POSTS
// ===============================
export async function GET() {
  try {
    // Fetch posts joined with author display name
    const allPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        authorDisplayName: profiles.displayName,
      })
      .from(posts)
      .leftJoin(profiles, eq(posts.authorProfileId, profiles.id))
      .orderBy(desc(posts.createdAt));

    return NextResponse.json({ posts: allPosts });
  } catch (err) {
    console.error("Error fetching posts:", err);
    return NextResponse.json(
      { error: "Failed to load posts" },
      { status: 500 }
    );
  }
}
