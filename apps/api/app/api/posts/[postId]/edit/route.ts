import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Validation
const editPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(3, "Content must be at least 3 characters"),
});

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const user = await getUser(req);
    const userId = Number(user?.id);
    if (!userId) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: No active session" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = editPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { status: 0, message: "Invalid input", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, content } = parsed.data;
    const postId = Number(params.postId);

    // Verify author
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorProfile: { select: { userId: true } } },
    });

    if (!post || post.authorProfile.userId !== userId) {
      return NextResponse.json(
        { status: 0, message: "You are not authorized to edit this post" },
        { status: 403 }
      );
    }

    // Update post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        edited: true,
        updatedAt: new Date(),
      },
      include: {
        authorProfile: true,
      },
    });

    return NextResponse.json(
      { status: 1, message: "Post updated successfully", data: updatedPost },
      { status: 200 }
    );
  } catch (err) {
    console.error("Edit post error:", err);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
