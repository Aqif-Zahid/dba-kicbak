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

// Backend returns this
type CreatePostResponse = {
  status: number; // 0 or 1
  message: string;
  data?: any;
};

// Inputs your server action accepts
type CreatePostInput = {
  title: string;
  content: string;
  mediaIds: string[];
  communityId?: number;
  type: "POLL" | "QUESTION" | "DISCUSSION";
  allowComments: boolean;
  options?: string[];
  duration?: { days: number; hours: number; minutes: number };
  allowMultiple?: boolean;
};

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  const mutation = useMutation<CreatePostResponse, Error, CreatePostInput>({
    mutationFn: async (input) => {
      const res = await createPost(input);
      // Force cast to ensure consistent shape
      return {
        status: res.status ?? 0,
        message: res.message ?? "Unexpected response",
        data: res.data,
      };
    },

    onSuccess: async (response) => {
      // Handle validation or failure response
      if (response.status === 0) {
        toast.error(response.message);
        return;
      }

      // Only proceed for successful posts
      const newPost = response.data;
      if (!newPost) {
        toast.error("Something went wrong. Post data missing.");
        return;
      }

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
          if (!oldData) return oldData;

          const firstPage = oldData.pages[0];
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

      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(q) {
          return queryFilter.predicate(q) && !q.state.data;
        },
      });

      toast.success(response.message || "Post created successfully!");
    },

    onError(error) {
      console.error(error);
      toast.error("Failed to post. Please try again.");
    },
  });

  return mutation;
}
