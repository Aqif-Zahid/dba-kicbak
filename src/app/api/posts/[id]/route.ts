import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, comments, profiles, votes } from "@/db/schema";
import { eq, asc, and, inArray } from "drizzle-orm"; // ✅ Added inArray
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// === Helper: Build nested comment tree ===
function buildCommentTree(all: any[]) {
  const byId = new Map<number, any>();
  const roots: any[] = [];

  all.forEach((c) => byId.set(c.id, { ...c, replies: [] }));

  all.forEach((c) => {
    const node = byId.get(c.id);
    if (c.parentId) {
      const parent = byId.get(c.parentId);
      if (parent) parent.replies.push(node);
      else roots.push(node);
    } else roots.push(node);
  });

  const sortRecursively = (arr: any[]) => {
    arr.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    arr.forEach((n) => sortRecursively(n.replies));
  };
  sortRecursively(roots);
  return roots;
}

// ======================
//  GET Single Post (with comments and userVote)
// ======================
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ Must await params in Next.js 14+
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id ? Number(session.user.id) : null;

    const postId = Number(id);
    if (Number.isNaN(postId))
      return NextResponse.json({ error: "Invalid post id" }, { status: 400 });

    const [postRow] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!postRow)
      return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const isDeleted = postRow.status === "DELETED";

    const [authorProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, postRow.authorProfileId))
      .limit(1);

    const postVotes = await db.select().from(votes).where(eq(votes.postId, postId));

    const postUpvotes = postVotes.filter((v) => v.voteType === "UPVOTE").length;
    const postDownvotes = postVotes.filter((v) => v.voteType === "DOWNVOTE").length;
    const postUserVote =
      currentUserId != null
        ? postVotes.find((v) => Number(v.userId) === currentUserId)?.voteType ?? null
        : null;

    const allComments = await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.createdAt));

    const commentIds = allComments.map((c) => c.id);
    const allVotes = commentIds.length
      ? await db.select().from(votes).where(inArray(votes.commentId, commentIds)) // ✅ FIXED: was eq(votes.postId, postId)
      : [];

    const allProfiles = await db.select().from(profiles);

    const mapped = allComments.map((c) => {
      const deleted = c.status === "DELETED";
      const commentVotes = allVotes.filter((v) => v.commentId === c.id);
      const upvotes = commentVotes.filter((v) => v.voteType === "UPVOTE").length;
      const downvotes = commentVotes.filter((v) => v.voteType === "DOWNVOTE").length;
      const userVote =
        currentUserId != null
          ? commentVotes.find((v) => Number(v.userId) === currentUserId)?.voteType ?? null
          : null;

      const author = allProfiles.find((p) => p.id === c.authorProfileId);

      return {
        id: c.id,
        content: deleted ? "[deleted]" : c.content,
        createdAt: c.createdAt,
        parentId: c.parentId,
        authorDisplayName: deleted
          ? "[deleted user]"
          : author?.displayName ?? "User",
        authorUserId: author?.userId ?? null,
        upvotes,
        downvotes,
        userVote,
        isDeleted: deleted,
      };
    });

    const nested = buildCommentTree(mapped);

    const hydrated = {
      id: postRow.id,
      title: isDeleted ? "[deleted]" : postRow.title,
      content: isDeleted ? "[deleted]" : postRow.content,
      createdAt: postRow.createdAt,
      authorDisplayName: isDeleted
        ? "[deleted user]"
        : authorProfile?.displayName ?? "User",
      authorProfileId: postRow.authorProfileId,
      upvotes: postUpvotes,
      downvotes: postDownvotes,
      userVote: postUserVote,
      status: postRow.status,
      comments: nested,
      isDeleted,
    };

    return NextResponse.json({ post: hydrated });
  } catch (error: any) {
    console.error("Post [id] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

// ======================
//  PATCH (Edit)
// ======================
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const postId = Number(id);
    const body = await req.json();
    const { title, content, status } = body;

    const [existing] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!existing)
      return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const [authorProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, existing.authorProfileId))
      .limit(1);

    const currentUserId = Number(session.user.id);
    const isAuthor = Number(authorProfile?.userId) === currentUserId;
    const isAdmin =
      ((session.user as any)?.role ?? "").toString().toUpperCase() === "ADMIN";

    if (!isAuthor && !isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await db
      .update(posts)
      .set({
        ...(title ? { title } : {}),
        ...(content ? { content } : {}),
        ...(status ? { status } : {}),
      })
      .where(eq(posts.id, postId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Post PATCH error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// ======================
//  DELETE (Soft delete)
// ======================
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const postId = Number(id);

    const [existing] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!existing)
      return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const [authorProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, existing.authorProfileId))
      .limit(1);

    const currentUserId = Number(session.user.id);
    const isAuthor = Number(authorProfile?.userId) === currentUserId;
    const isAdmin =
      ((session.user as any)?.role ?? "").toString().toUpperCase() === "ADMIN";

    if (!isAuthor && !isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await db
      .update(posts)
      .set({ status: "DELETED" })
      .where(eq(posts.id, postId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Post DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
