import { api } from "@/lib/api";
import { PostsPage } from "@/types/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

export function useDeletePost() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const mutation = useMutation({
    mutationFn: async (postId: number) => {
      const { data } = await api.delete(`/api/posts/${postId}`);
      return data;
    },
    onSuccess: async (deletePost) => {
        const queryFilter = {
          queryKey: ["post-feed"],
          predicate(query) {
            // Match: ["post-feed", "for-you"], ["post-feed", "user-posts", ...], etc.
            return query.queryKey.includes("post-feed");
          },
        } satisfies QueryFilters;

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
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

        // Also remove the single-post cache so post details updates instantly
        queryClient.removeQueries({ queryKey: ["post", String(deletePost.id)] });

        // Kick any other post-feed variants to re-render/refetch if needed
        queryClient.invalidateQueries(queryFilter);
      toast.success("Post deleted successfully!");
      if (pathname === `/posts/${deletePost.id}`) {
        router.push(`/${deletePost.authorProfile.username}`);
      }
    },
    onError(error: any) {
        console.error("[delete-post] axios message:", error?.message);
        console.error("[delete-post] status:", error?.response?.status);
        console.error("[delete-post] data:", error?.response?.data);
        console.error("[delete-post] url:", error?.config?.url);
        console.error("[delete-post] baseURL:", error?.config?.baseURL);
        toast.error(error?.response?.data?.message || "Failed to delete post. Please try again.");
      },
  });

  return mutation;
}
