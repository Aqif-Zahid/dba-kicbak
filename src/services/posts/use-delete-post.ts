import { deletePost } from "@/actions/post-actions";
import { Post } from "@/types/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async (deletePost) => {
      const queryFilter: QueryFilters = {
        queryKey: ["post-feed"],
      };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<Post, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) {
            return;
          }
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((post) => post.id !== deletePost.id),
            })),
          };
        }
      );
      toast.success("Post deleted successfully!");
      if (pathname === `/posts/${deletePost.id}`) {
        router.push(`/users/${deletePost.authorProfile.username}`);
      }
    },
    onError(error) {
      console.error(error);
      toast.error("Failed to delete post. Please try again.");
    },
  });

  return mutation;
};
