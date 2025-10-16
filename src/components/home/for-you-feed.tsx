"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { InfiniteScrollContainer } from "@/components/infinite-scroll-container";
import { LoadingSkeleton } from "../posts/loading-skeleton";
import { PostCard } from "../posts/post-card";
import axios from "axios";
import { Card, CardContent } from "../ui/card";
import { AlertTriangle, Info } from "lucide-react";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

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
      <Card className="mx-auto mt-10 max-w-md text-center shadow-sm">
        <CardContent className="py-10 flex flex-col items-center gap-3">
          <Info className="h-10 w-10 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            No posts yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Be the first to share something interesting!
          </p>
          <Button className="mt-2">Create your first post</Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto mt-10 max-w-md">
        <Alert variant="destructive" className="border-destructive/50">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Error loading posts</AlertTitle>
          <AlertDescription>
            An error occurred while fetching posts. Please try again later.
          </AlertDescription>
        </Alert>
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
