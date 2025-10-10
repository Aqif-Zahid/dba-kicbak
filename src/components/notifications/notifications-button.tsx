"use client";

import { Button } from "@/components/ui/button";
import { NotificationCountInfo } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Bell } from "lucide-react";
import Link from "next/link";

interface NotificationsButtonProps {
  initialState: NotificationCountInfo;
}

export const NotificationsButton = ({
  initialState,
}: NotificationsButtonProps) => {
  const { data } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: async () => {
      const res = await axios.get<NotificationCountInfo>(
        "/api/notifications/unread-count"
      );
      return res.data;
    },
    initialData: initialState,
    refetchInterval: 60 * 1000,
  });

  return (
    <Button
      variant="ghost"
      className="flex items-center justify-start gap-3"
      title="Notifications"
      asChild
    >
      <Link href="/notifications">
        <div className="relative">
          <Bell />
          {!!data?.unreadCount && (
            <span className="absolute -right-1 -top-1 rounded-full bg-primary text-primary-foreground px-1 text-xs font-medium tabular-nums">
              {data.unreadCount}
            </span>
          )}
        </div>

        <span className="hidden lg:inline">Notifications</span>
      </Link>
    </Button>
  );
};
