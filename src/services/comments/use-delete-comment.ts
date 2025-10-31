import { deleteComment } from "@/actions/comments/delete-comment-actions";
import { CommentsPage } from "@/types/types";
import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteComment() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: async (deletedComment) => {
      const queryKey: QueryKey = ["comments", deletedComment.postId];

      await queryClient.cancelQueries({ queryKey });

      // ⬇️ Use the new envelope shape: page.data.comments (not page.comments)
      queryClient.setQueryData<InfiniteData<any, string | null>>(
        queryKey,
        (oldData) => {
          if (!oldData) {
            return;
          }
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                comments: (page?.data?.comments ?? []).filter(
                  (c: any) => c?.id !== deletedComment.id
                ),
                previousCursor: page?.data?.previousCursor ?? null,
              },
            })),
          } as InfiniteData<any, string | null>;
        }
      );

      // 🔽 Decrement comments count in the single-post cache
      const postKey = ["post", String(deletedComment.postId)];
      queryClient.setQueryData(postKey, (old: any) => {
        if (!old?.data) return old;
        const prev = old.data?._count?.comments ?? 0;
        return {
          ...old,
          data: {
            ...old.data,
            _count: {
              ...old.data._count,
              comments: Math.max(0, prev - 1),
            },
          },
        };
      });

      // 🔽 Decrement comments count in the feed cache (For You)
      queryClient.setQueriesData({ queryKey: ["for-you"] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: any) =>
              p.id === deletedComment.postId
                ? {
                    ...p,
                    _count: {
                      ...p._count,
                      comments: Math.max(0, (p._count?.comments ?? 0) - 1),
                    },
                  }
                : p
            ),
          })),
        };
      });

      toast.success("Comment deleted successfully");
    },
    onError(error) {
      console.error(error);
      toast.error("Failed to delete comment. Please try again.");
    },
  });

  return mutation;
}
