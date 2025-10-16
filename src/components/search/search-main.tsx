"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { InfiniteScrollContainer } from "@/components/infinite-scroll-container";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Info } from "lucide-react";
import { LoadingSkeleton } from "../posts/loading-skeleton";
import { PostCard } from "../posts/post-card";
import axios from "axios";

interface SearchMainProps {
  query: string;
}

export const SearchMain = ({ query }: SearchMainProps) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "search", query],
    queryFn: async ({ pageParam }) => {
      const res = await axios.get("/api/search", {
        params: {
          q: query,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
      });
      return res.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    gcTime: 0,
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
            Nothing Found with this search
          </h3>
          <p className="text-sm text-muted-foreground">
            Please try again with another thing
          </p>
          <Button className="mt-2">Home</Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center text-destructive">
        An error occurred while searching
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {isFetchingNextPage && <LoadingSkeleton />}
    </InfiniteScrollContainer>
  );
};
