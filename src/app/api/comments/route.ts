import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comments, profiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// ===============================
// 🟢 CREATE COMMENT (reply)
// ===============================
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId, content, parentId } = await req.json();

    if (!postId || !content) {
      return NextResponse.json(
        { error: "Post ID and content are required" },
        { status: 400 }
      );
    }

    // ✅ Get the user's profile
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

    // ✅ Insert the comment
    const newComment = await db
      .insert(comments)
      .values({
        authorProfileId: profile[0].id,
        postId,
        content,
        parentId: parentId || null,
        upvotes: 0,
        downvotes: 0,
      })
      .returning();

    return NextResponse.json({ success: true, comment: newComment[0] });
  } catch (err) {
    console.error("Create comment error:", err);
    return NextResponse.json(
      { error: "Something went wrong while creating the comment" },
      { status: 500 }
    );
  }
}

// ===============================
// 🔵 GET COMMENTS FOR A POST
// ===============================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // ✅ Fetch all comments for the given post, with author display names
    const postComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        parentId: comments.parentId,
        authorDisplayName: profiles.displayName,
      })
      .from(comments)
      .leftJoin(profiles, eq(comments.authorProfileId, profiles.id))
      .where(eq(comments.postId, Number(postId)))
      .orderBy(desc(comments.createdAt));

    return NextResponse.json({ comments: postComments });
  } catch (err) {
    console.error("Error fetching comments:", err);
    return NextResponse.json(
      { error: "Failed to load comments" },
      { status: 500 }
    );
  }
}
