"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { InfiniteScrollContainer } from "@/components/infinite-scroll-container";
import axios from "axios";
import { LoadingSkeleton } from "../posts/loading-skeleton";
import { PostCard } from "../posts/post-card";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Info } from "lucide-react";

export const Bookmarks = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "bookmarks"],
    queryFn: async ({ pageParam }) => {
      const res = axios.get(
        "/api/posts/bookmarked",
        pageParam ? { params: { cursor: pageParam } } : {}
      );
      return (await res).data;
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
            You don't have any bookmark yet.
          </h3>
          <p className="text-sm text-muted-foreground">
            Please add some bookmarks from the posts section!
          </p>
          <Button className="mt-2">Home</Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center text-destructive">
        An error occurred while fetching bookmark
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
