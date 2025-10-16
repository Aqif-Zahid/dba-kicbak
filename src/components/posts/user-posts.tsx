"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { LoadingSkeleton } from "./loading-skeleton";
import { InfiniteScrollContainer } from "../infinite-scroll-container";
import { PostCard } from "./post-card";
interface UserPostsProps {
  profileId: number;
}

export const UserPosts = ({ profileId }: UserPostsProps) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "user-posts", profileId],
    queryFn: async ({ pageParam }) => {
      const res = await axios.get(
        `/api/profiles/${profileId}/posts`,
        pageParam ? { params: { cursor: pageParam } } : {}
      );
      return res.data;
    },

    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return <LoadingSkeleton />;
  }
  if (status === "success" && !posts.length && !hasNextPage) {
    return <p className="text-center text-muted-foreground">No post yet</p>;
  }

  if (status === "error") {
    return (
      <div className="text-center text-destructive">
        An error occurred while fetching posts
      </div>
    );
  }
  return (
    <InfiniteScrollContainer
      className="space-y-5 "
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {isFetchingNextPage && <LoadingSkeleton />}
    </InfiniteScrollContainer>
  );
};
