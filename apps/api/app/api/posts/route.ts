import { NextRequest, NextResponse } from "next/server";
import { createPost } from "@/actions/posts/create-post-actions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const result = await createPost(body ?? {});

    // createPost already returns {status,message,data?} in your standard shape
    return NextResponse.json(result, { status: result?.status === 1 ? 200 : 400 });
  } catch (error: any) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { status: 0, message: error?.message || "Failed to create post" },
      { status: 500 }
    );
  }
}
