import { NextRequest, NextResponse } from "next/server";
import { deleteComment } from "@/actions/comments/delete-comment-actions";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const id = Number(params.commentId);
    if (!id) {
      return NextResponse.json(
        { status: 0, message: "Invalid commentId" },
        { status: 400 }
      );
    }

    const deletedComment = await deleteComment(id);

    return NextResponse.json(
      { status: 1, message: "Comment deleted successfully", data: deletedComment },
      { status: 200 }
    );
  } catch (error: any) {
    const msg = error?.message || "Failed to delete comment";

    // Map common action errors to HTTP status codes
    const status =
      msg === "Unauthorized" ? 401 :
      msg === "Comment not found" ? 404 :
      msg === "Invalid commentId" ? 400 :
      500;

    return NextResponse.json(
      { status: 0, message: msg },
      { status }
    );
  }
}
