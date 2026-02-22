import { api } from "@/lib/api";
// NOTE: The API now returns an envelope { status, data: { comments, previousCursor }, commentsDisabled }.
// We’ll update the cache mutation accordingly while keeping the rest intact.
import { CommentsPage } from "@/types/types";
import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (payload: any) => {
    const { data } = await api.post("/api/comments", payload);
    return data?.data ?? data;
  },
    onSuccess: async (newComment) => {
      const queryKey: QueryKey = ["comments", postId];

      await queryClient.cancelQueries({ queryKey });

      // The query now stores pages shaped like:
      // { status: 1, data: { comments: Comment[], previousCursor: string | null }, commentsDisabled?: boolean }
      queryClient.setQueryData<InfiniteData<any, string | null>>( // <- use 'any' to accept the envelope
        queryKey,
        (oldData) => {
          // If no cache exists yet, create a first page with the new comment
          if (!oldData || !oldData.pages?.length) {
            return {
              pageParams: [null],
              pages: [
                {
                  status: 1,
                  data: {
                    comments: [newComment],
                    previousCursor: null,
                  },
                  commentsDisabled: false,
                },
              ],
            } as InfiniteData<any, string | null>;
          }

          const firstPage = oldData.pages[0];
          const prevComments = firstPage?.data?.comments ?? [];

          // Return the same structure, just append the new comment to the first page
          return {
            pageParams: oldData.pageParams,
            pages: [
              {
                ...firstPage,
                data: {
                  ...firstPage.data,
                  comments: [...prevComments, newComment],
                  previousCursor: firstPage.data?.previousCursor ?? null,
                },
              },
              ...oldData.pages.slice(1),
            ],
          } as InfiniteData<any, string | null>;
        }
      );

      // 🔼 Increment comments count in the single-post cache (PostDetails/PostCard)
      const postKey = ["post", String(postId)];
      queryClient.setQueryData(postKey, (old: any) => {
        if (!old?.data) return old;
        const prev = old.data?._count?.comments ?? 0;
        return {
          ...old,
          data: {
            ...old.data,
            _count: {
              ...old.data._count,
              comments: prev + 1,
            },
          },
        };
      });

      // 🔼 Increment comments count in the feed cache (For You)
      queryClient.setQueriesData({ queryKey: ["post-feed", "for-you"] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: any) =>
              p.id === postId
                ? {
                    ...p,
                    _count: {
                      ...p._count,
                      comments: (p._count?.comments ?? 0) + 1,
                    },
                  }
                : p
            ),
          })),
        };
      });

      queryClient.invalidateQueries({
        queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });
      toast.success("Comment added successfully");
    },
    onError(error) {
      console.error(error);
      toast.error("Failed to add comment. Please try again.");
    },
  });

  return mutation;
}
