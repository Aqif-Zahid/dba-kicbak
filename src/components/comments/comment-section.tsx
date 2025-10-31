"use client";

import { useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
    getNextPageParam: (firstPage) => firstPage?.data?.previousCursor ?? null,
    select: (data) => ({
      pages: [...data.pages].reverse(),
      pageParams: [...data.pageParams].reverse(),
    }),
  });

  useEffect(() => {
    refetch();
  }, [post.allowComments, post.id, refetch, queryClient]);

  const comments =
    data?.pages?.flatMap((page) => page?.data?.comments ?? []) ?? [];

  const commentsDisabled =
    data?.pages?.[data.pages.length - 1]?.commentsDisabled ?? false;

  return (
    <div className="mt-4">
      {!commentsDisabled ? (
        <CommentInput post={post} />
      ) : (
        <p className="text-sm text-muted-foreground italic mb-4">
          Commenting is disabled for this post.
        </p>
      )}

      {/* Load older comments */}
      {hasNextPage && (
        <Button
          variant="link"
          className="mx-auto block"
          disabled={isFetching}
          onClick={() => fetchNextPage()}
        >
          Load previous comments
        </Button>
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

      {/* Safe rendering of comments */}
      <div className="divide-y">
        {comments.map((comment) =>
          comment ? <Comment key={comment.id} comment={comment} /> : null
        )}
      </div>
    </div>
  );
};
