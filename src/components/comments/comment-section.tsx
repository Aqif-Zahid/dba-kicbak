"use client";

import { useEffect, useMemo } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, PinIcon, CheckCircle2 } from "lucide-react";
import { Post } from "@/types/types";
import axios from "axios";
import { CommentInput } from "./comment-input";
import { Comment } from "./comment";

interface CommentSectionProps {
  post: Post;
}

export const CommentSection = ({ post }: CommentSectionProps) => {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["comments", post.id],
    queryFn: async ({ pageParam }) => {
      const res = await axios.get(
        `/api/posts/${post.id}/comments`,
        pageParam ? { params: { cursor: pageParam } } : {}
      );
      return res.data;
    },
    initialPageParam: null as string | null,
    // keep comment order natural: newest first, older below
    getNextPageParam: (lastPage) => lastPage?.data?.previousCursor ?? null,
  });

  useEffect(() => {
    refetch();
  }, [post.allowComments, post.id, refetch, queryClient]);

  // flatten comments
  const comments =
    data?.pages?.flatMap((page) => page?.data?.comments ?? []) ?? [];

  const commentsDisabled =
    data?.pages?.[data.pages.length - 1]?.commentsDisabled ?? false;

  // separate pinned comment
  const { pinnedComment, otherComments } = useMemo(() => {
    const pinned = comments.find((c) => c.isPinned);
    const rest = comments.filter((c) => !c.isPinned);
    return { pinnedComment: pinned, otherComments: rest };
  }, [comments]);

  const answered = post.type === "QUESTION" && post.hasBestAnswer;

  return (
    <div className="mt-4">
      {/* Comment input or disabled message */}
      {!commentsDisabled ? (
        <CommentInput post={post} />
      ) : (
        <p className="text-sm text-muted-foreground italic mb-4">
          {answered
            ? "This question has been answered."
            : "Commenting is disabled for this post."}
        </p>
      )}

      {/* States */}
      {status === "pending" && <Loader2 className="mx-auto animate-spin" />}
      {status === "success" && comments.length === 0 && (
        <p className="text-center text-muted-foreground">No comments yet.</p>
      )}
      {status === "error" && (
        <p className="text-center text-destructive">
          An error occurred while loading comments.
        </p>
      )}

      {/* Render pinned comment at top */}
      <div className="divide-y">
        {pinnedComment && (
          <div className="bg-muted/40 rounded-md p-2 mb-2">
            {post.type === "QUESTION" ? (
              <div className="flex items-center gap-1 text-xs font-medium text-green-600 mb-1 ml-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span>Best Answer</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1 ml-1">
                <PinIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Pinned Comment</span>
              </div>
            )}
            <Comment comment={pinnedComment} />
          </div>
        )}

        {/* Render rest of comments */}
        {otherComments.map((comment) =>
          comment ? <Comment key={comment.id} comment={comment} /> : null
        )}
      </div>

      {/* Move “Load previous comments” BELOW all comments */}
      {hasNextPage && (
        <div className="flex justify-center mt-4">
          <Button
            variant="link"
            disabled={isFetching}
            onClick={() => fetchNextPage()}
          >
            {isFetching ? "Loading..." : "Load previous comments"}
          </Button>
        </div>
      )}
    </div>
  );
};
