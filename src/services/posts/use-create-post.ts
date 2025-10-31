import { createPost } from "@/actions/posts/create-post-actions";
import { useUser } from "@/providers/auth-provider";
import { PostsPage } from "@/types/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

// Inputs your server action now accepts
type CreatePostInput = {
  title: string;
  content: string;
  mediaIds: string[];
  communityId?: number;
  type: "POLL" | "QUESTION" | "DISCUSSION";
  allowComments: boolean;
};

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  const mutation = useMutation({
    // pass the input through to the server action
    mutationFn: (input: CreatePostInput) => createPost(input),

    onSuccess: async (newPost) => {
      // keep your existing feed cache update behavior
      const queryFilter = {
        queryKey: ["post-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("for-you") ||
            (query.queryKey.includes("user-posts") &&
              query.queryKey.includes(user?.defaultProfileId))
          );
        },
      } satisfies QueryFilters;

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];
          if (!firstPage) return oldData;
          return {
            pageParams: oldData.pageParams,
            pages: [
              {
                posts: [newPost, ...firstPage.posts],
                nextCursor: firstPage.nextCursor,
              },
              ...oldData.pages.slice(1),
            ],
          };
        }
      );

      // re-fetch for queries that had no data yet
      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(q) {
          return queryFilter.predicate(q) && !q.state.data;
        },
      });

      toast.success("Post created successfully");
    },

    onError(error) {
      console.error(error);
      toast.error("Failed to post. Please try again.");
    },
  });

  return mutation;
}
