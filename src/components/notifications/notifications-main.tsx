"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { InfiniteScrollContainer } from "@/components/infinite-scroll-container";
import { useEffect } from "react";
import axios from "axios";
import { LoadingSkeleton } from "../posts/loading-skeleton";
import { Notification } from "./notification";
import { Card, CardContent } from "../ui/card";
import { Info } from "lucide-react";
import { Button } from "../ui/button";

export const NotificationsMain = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: async ({ pageParam }) => {
      const res = await axios.get(
        "/api/notifications",
        pageParam ? { params: { cursor: pageParam } } : {}
      );
      return res.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async () => {
      const res = await axios.patch("/api/notifications/mark-as-read");
      return res.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(["unread-notification-count"], {
        unreadCount: 0,
      });
    },
    onError: (error) => {
      console.log("Failed to mark notifications as read", error);
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  const notifications = data?.pages.flatMap((page) => page.notifications) || [];

  if (status === "pending") {
    return <LoadingSkeleton />;
  }
  if (status === "success" && !notifications.length && !hasNextPage) {
    return (
      <Card className="mx-auto mt-10 max-w-md text-center shadow-sm">
        <CardContent className="py-10 flex flex-col items-center gap-3">
          <Info className="h-10 w-10 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            You don't have any notification yet.
          </h3>

          <Button className="mt-2">Home</Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center text-destructive">
        An error occurred while fetching notification
      </div>
    );
  }
  return (
    <InfiniteScrollContainer
      className="space-y-5 "
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {notifications.map((notification) => (
        <Notification key={notification.id} notification={notification} />
      ))}

      {isFetchingNextPage && <LoadingSkeleton />}
    </InfiniteScrollContainer>
  );
};
