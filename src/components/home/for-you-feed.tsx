"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { InfiniteScrollContainer } from "@/components/infinite-scroll-container";
import { LoadingSkeleton } from "../posts/loading-skeleton";
import { PostCard } from "../posts/post-card";
import axios from "axios";

export const ForYouFeed = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "for-you"],
    queryFn: async ({ pageParam }) => {
      const res = await axios.get(
        `/api/posts/for-you`,
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
    return (
      <p className="text-center text-muted-foreground">No one has posted yet</p>
    );
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
