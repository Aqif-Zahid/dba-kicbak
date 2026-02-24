"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { LoadingSkeleton } from "./loading-skeleton";
import { InfiniteScrollContainer } from "../infinite-scroll-container";
import { PostCard } from "./post-card";
import { Inbox } from "lucide-react";
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
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-gray-500">
        <Inbox className="h-10 w-10 text-gray-400" />
        <p className="text-gray-500 font-medium text-lg">No posts yet</p>
      </div>
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
