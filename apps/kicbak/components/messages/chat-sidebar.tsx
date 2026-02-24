"use client";
import {
  ChannelList,
  ChannelPreviewMessenger,
  ChannelPreviewUIComponentProps,
  useChatContext,
} from "stream-chat-react";
import { cn } from "@/lib/utils";
import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/providers/auth-provider";
import { ChatMenuHeader } from "./chat-menu-header";
import type { ChannelFilters } from "stream-chat";

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

export const ChatSidebar = ({ open, onClose }: ChatSidebarProps) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { channel } = useChatContext();

  useEffect(() => {
    if (channel?.id) {
      queryClient.invalidateQueries({
        queryKey: ["unread-message-count"],
      });
    }
  }, [channel?.id, queryClient]);

  const ChannelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => (
      <ChannelPreviewMessenger
        {...props}
        onSelect={() => {
          props.setActiveChannel?.(props.channel, props.watchers);
          onClose();
        }}
      />
    ),
    [onClose]
  );

  // ----------------- Fix filters -----------------
  const memberIds = [user?.defaultProfileId].filter(
    (id): id is number => id !== undefined
  ); // remove undefined
  const filters: ChannelFilters = {
    type: "messaging",
    members: {
      $in: memberIds.map(String), // convert to strings
    },
  };

  const options = { state: true, presence: true, limit: 8 };

  return (
    <div
      className={cn(
        "size-full flex flex-col border-e md:flex md:w-72 ",
        open ? "flex" : "hidden"
      )}
    >
      <ChatMenuHeader onClose={onClose} />
      <ChannelList
        filters={filters}
        sort={{ last_message_at: -1 }}
        options={options}
        showChannelSearch
        additionalChannelSearchProps={{
          searchForChannels: true,
          searchQueryParams: {
            channelFilters: {
              filters,
              options: { state: true, presence: true, limit: 8 },
              sort: { last_message_at: -1 },
            },
          },
        }}
        // Filter out duplicate channels before rendering
        channelRenderFilterFn={(channels) =>
          channels.filter(
            (channel, index, self) =>
              self.findIndex((c) => c.id === channel.id) === index
          )
        }
        Preview={ChannelPreviewCustom}
      />
    </div>
  );
};
