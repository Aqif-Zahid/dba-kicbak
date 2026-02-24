import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface EditCommentInput {
  commentId: number;
  postId: number;
  content: string;
}

export const useEditComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, content }: EditCommentInput) => {
      const res = await axios.patch(`/api/comments/${commentId}/edit`, { content });
      return res.data;
    },

    onSuccess: (response, variables) => {
      if (response.status === 1) {
        toast.success(response.message || "Comment updated successfully");
        const updatedComment = response.data;

        // Safely update cached comments (check structure first)
        queryClient.setQueryData(["comments", variables.postId], (old: any) => {
          if (!old) return old;

          // If paginated structure (old.pages)
          if (Array.isArray(old.pages)) {
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                comments: Array.isArray(page.comments)
                  ? page.comments.map((c: any) =>
                      c.id === updatedComment.id
                        ? {
                            ...c,
                            content: updatedComment.content,
                            edited: true,
                            updatedAt: updatedComment.updatedAt,
                          }
                        : c
                    )
                  : page.comments, // fallback if undefined
              })),
            };
          }

          // If flat comments array (non-paginated)
          if (Array.isArray(old.comments)) {
            return {
              ...old,
              comments: old.comments.map((c: any) =>
                c.id === updatedComment.id
                  ? {
                      ...c,
                      content: updatedComment.content,
                      edited: true,
                      updatedAt: updatedComment.updatedAt,
                    }
                  : c
              ),
            };
          }

          return old;
        });

        // Revalidate in background
        queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
      } else {
        toast.error(response.message || "Failed to update comment");
      }
    },

    onError: (err: any) => {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong while editing the comment";
      toast.error(message);
    },
  });
};
