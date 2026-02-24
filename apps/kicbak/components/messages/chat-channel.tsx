"use client";
import { cn } from "@/lib/utils";
import { Channel, MessageInput, MessageList, Window } from "stream-chat-react";
import { CustomerChannelHeader } from "./custom-channel-header";

interface ChatChannelProps {
  open: boolean;
  openSidebar: () => void;
}

export const ChatChannel = ({ open, openSidebar }: ChatChannelProps) => {
  return (
    <div className={cn("w-full md:block", !open && "hidden")}>
      <Channel>
        <Window>
          <CustomerChannelHeader openSidebar={openSidebar} />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </div>
  );
};
