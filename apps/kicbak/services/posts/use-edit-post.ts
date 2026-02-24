import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface EditPostInput {
  postId: number;
  title: string;
  content: string;
}

export const useEditPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, title, content }: EditPostInput) => {
      const res = await axios.post(`/api/posts/${postId}/edit`, { title, content });
      return res.data;
    },

    onSuccess: (response) => {
      if (response.status === 1) {
        toast.success(response.message || "Post updated successfully");

        const updatedPost = response.data;

        // Instantly update the post detail cache
        queryClient.setQueryData(["post", updatedPost.id], (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              title: updatedPost.title,
              content: updatedPost.content,
              edited: true,
              updatedAt: updatedPost.updatedAt,
            },
          };
        });

        // Instantly update the post in the feed cache
        queryClient.setQueriesData({ queryKey: ["for-you"] }, (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts: page.posts.map((p: any) =>
                p.id === updatedPost.id
                  ? {
                      ...p,
                      title: updatedPost.title,
                      content: updatedPost.content,
                      edited: true,
                      updatedAt: updatedPost.updatedAt,
                    }
                  : p
              ),
            })),
          };
        });

        // Optionally revalidate in background for freshness
        queryClient.invalidateQueries({ queryKey: ["post", updatedPost.id] });
        queryClient.invalidateQueries({ queryKey: ["for-you"] });
      } else {
        toast.error(response.message || "Failed to update post");
      }
    },

    onError: (err: any) => {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong while updating the post";
      toast.error(message);
    },
  });
};
