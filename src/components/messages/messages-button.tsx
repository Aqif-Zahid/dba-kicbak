"use client";
import { MessageCountInfo } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { MessageCircleMore } from "lucide-react";
import Link from "next/link";

interface MessagesButtonProps {
  initialState: MessageCountInfo;
}

export const MessagesButton = ({ initialState }: MessagesButtonProps) => {
  const { data } = useQuery({
    queryKey: ["unread-message-count"],
    queryFn: async () => {
      const res = await axios.get<MessageCountInfo>(
        "/api/notifications/unread-count"
      );
      return res.data;
    },
    initialData: initialState,
    refetchInterval: 60 * 1000,
  });

  return (
    <Link
      href="/messages"
      className="relative flex items-center justify-center w-12 h-12 rounded-full text-muted-foreground transition-colors"
    >
      <div className="relative">
        <MessageCircleMore size={20} />
        {!!data.unreadCount && (
          <span className="absolute -right-1 -top-1 rounded-full bg-primary text-primary-foreground px-1 text-xs font-medium tabular-nums">
            {data.unreadCount}
          </span>
        )}
      </div>
    </Link>
  );
};
