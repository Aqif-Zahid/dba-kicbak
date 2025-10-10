"use client";
import { Button } from "@/components/ui/button";
import { MessageCountInfo } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Mail } from "lucide-react";
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
    <Button
      variant="ghost"
      className="flex items-center justify-start gap-3 mb-2 hover:bg-primary hover:text-white"
      title="Messages"
      asChild
    >
      <Link href="/messages">
        <div className="relative">
          <Mail />
          {!!data.unreadCount && (
            <span className="absolute -right-1 -top-1 rounded-full bg-primary text-primary-foreground px-1 text-xs font-medium tabular-nums">
              {data.unreadCount}
            </span>
          )}
        </div>

        <span className="hidden lg:inline">Messages</span>
      </Link>
    </Button>
  );
};
