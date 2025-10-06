import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, profiles, communities } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// Helper: ensure a default "general" community exists and return its id
async function ensureDefaultCommunity(ownerUserId: number): Promise<number> {
  // Try to find an existing "general" community
  const existing = await db
    .select({ id: communities.id })
    .from(communities)
    .where(eq(communities.slug, "general"))
    .limit(1);

  if (existing.length > 0) return existing[0].id;

  // Create it if missing
  const inserted = await db
    .insert(communities)
    .values({
      name: "General",
      slug: "general",
      description: "Default community for general discussions",
      ownerId: ownerUserId,
    })
    .returning({ id: communities.id });

  return inserted[0].id;
}

// ===============================
// 🟢 CREATE POST
// ===============================
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, communityId: incomingCommunityId } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const userId = Number((session.user as any)?.id);
    const activeProfileId = Number((session.user as any)?.activeProfileId) || null;

    // Resolve author profile id
    let authorProfileId: number | null = null;

    if (activeProfileId) {
      // Trust activeProfileId if present
      const p = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.id, activeProfileId))
        .limit(1);

      if (p.length === 0) {
        return NextResponse.json(
          { error: "Active profile not found" },
          { status: 404 }
        );
      }
      authorProfileId = p[0].id;
    } else {
      // Fall back to the first profile for this user
      const p = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);

      if (p.length === 0) {
        return NextResponse.json(
          { error: "Profile not found for this user" },
          { status: 404 }
        );
      }
      authorProfileId = p[0].id;
    }

    // Resolve community id: use provided or ensure "general"
    const communityId = incomingCommunityId
      ? Number(incomingCommunityId)
      : await ensureDefaultCommunity(userId);

    const newPost = await db
      .insert(posts)
      .values({
        authorProfileId: authorProfileId!,
        communityId,
        title,
        content,
        status: "PUBLISHED",
      })
      .returning();

    return NextResponse.json({ success: true, post: newPost[0] });
  } catch (err: any) {
    console.error("❌ Create post error:", err);
    return NextResponse.json(
      { error: err?.message || "Something went wrong while creating the post" },
      { status: 500 }
    );
  }
}

// ===============================
// 🔵 GET ALL POSTS (optional ?limit=10)
// ===============================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : 50;

    const rows = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        authorDisplayName: profiles.displayName,
        upvotes: posts.upvotes,
        downvotes: posts.downvotes,
      })
      .from(posts)
      .leftJoin(profiles, eq(posts.authorProfileId, profiles.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit);

    return NextResponse.json({ posts: rows });
  } catch (err: any) {
    console.error("❌ Error fetching posts:", err);
    return NextResponse.json(
      { error: "Failed to load posts" },
      { status: 500 }
    );
  }
}
