"use client";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookmarkInfo } from "@/types/types";
import { toast } from "sonner";
import axios from "axios";
import { useBookmarkInfo } from "@/services/bookmarks/use-bookmark-info";

interface BookmarkButtonProps {
  postId: number;
  initialState: BookmarkInfo;
}

export const BookmarkButton = ({
  postId,
  initialState,
}: BookmarkButtonProps) => {
  const queryClient = useQueryClient();
  const { data } = useBookmarkInfo(postId, initialState);

  const { mutate } = useMutation({
    mutationFn: async () =>
      data.isBookmarkedByUser
        ? await axios.delete(`/api/posts/${postId}/bookmarks`)
        : await axios.post(`/api/posts/${postId}/bookmarks`),
    onMutate: async () => {
      toast.success(`Post ${data.isBookmarkedByUser ? "un" : ""}bookmarked`);
      const queryKey: QueryKey = ["bookmark-info", postId];
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<BookmarkInfo>(queryKey);
      queryClient.setQueryData<BookmarkInfo>(queryKey, () => ({
        isBookmarkedByUser: !previousState?.isBookmarkedByUser,
      }));

      return { previousState };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousState) {
        queryClient.setQueryData<BookmarkInfo>(
          ["bookmark-info", postId],
          context.previousState
        );
      }
      toast.error("Failed to update bookmark status. Please try again.");
    },
  });

  return (
    <button className="flex items-center gap-2" onClick={() => mutate()}>
      <Bookmark
        className={cn(
          "size-5",
          data.isBookmarkedByUser && "fill-primary text-primary"
        )}
      />
    </button>
  );
};
