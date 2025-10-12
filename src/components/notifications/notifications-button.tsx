"use client";

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
    <Link
      href="/notifications"
      className="relative flex items-center justify-center w-12 h-12 rounded-full 
                 text-muted-foreground transition-colors"
      title="Notifications"
    >
      <Bell size={20} />
      {!!data?.unreadCount && (
        <span className="absolute -right-2 -top-2 rounded-full bg-primary text-primary-foreground px-1 text-xs font-medium tabular-nums">
          {data.unreadCount}
        </span>
      )}
    </Link>
  );
};
