"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  ChannelHeader,
  ChannelHeaderProps,
  useChatContext,
} from "stream-chat-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserAvatar } from "../common/user-avatar";
import { useRouter } from "next/navigation";

interface CustomerChannelHeaderProps extends ChannelHeaderProps {
  openSidebar: () => void;
}

export const CustomerChannelHeader = ({
  openSidebar,
  ...props
}: CustomerChannelHeaderProps) => {
  const router = useRouter();

  const { channel } = useChatContext();
  const [open, setOpen] = useState(false);

  const members = Object.values(channel?.state?.members || {});

  return (
    <div className="flex items-center gap-3 w-full">
      {/* Sidebar toggle button */}
      <div className="h-full p-2 md:hidden">
        <Button size="icon" variant="ghost" onClick={openSidebar}>
          <Menu className="size-5" />
        </Button>
      </div>

      {/* Custom Channel Header */}
      <ChannelHeader
        {...props}
        Avatar={() => (
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setOpen(true)}
              className="p-0"
            >
              <UserAvatar
                avatarUrl={(channel?.data as any)?.image}
                avatarFallback={
                  (channel?.data as any)?.name?.charAt(0)?.toUpperCase() || "G"
                }
              />
            </Button>

            {/* Members Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Chat Members</DialogTitle>
                </DialogHeader>

                <div className="mt-2 max-h-80 overflow-y-auto">
                  {members.map((member: any) => {
                    const user = member.user;
                    return (
                      <div
                        key={user.id}
                        className="cursor-pointer flex items-center gap-3 rounded-md p-2 hover:bg-muted/50"
                        onClick={() => router.push(`/${user.username}`)}
                      >
                        <UserAvatar
                          avatarUrl={user.image}
                          avatarFallback={user.name?.charAt(0) || "U"}
                        />
                        <div className="flex flex-col">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.username || user.id}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      />
    </div>
  );
};
