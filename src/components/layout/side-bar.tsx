import { Home, Bookmark, FileText } from "lucide-react";
import { Button } from "../ui/button";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { NotificationsButton } from "../notifications/notifications-button";
import { MessagesButton } from "../messages/messages-button";
import LogOutButton from "./log-out-button";
import { SwitchProfile } from "./switch-profile";
import streamServerClient from "@/lib/stream";

interface MenubarProps {
  className?: string;
  user: any;
}

export const Sidebar = async ({ className, user }: MenubarProps) => {
  let unreadNotificationsCount = 0;
  let unreadMessagesCount = 0;

  if (user) {
    // Upsert Stream user
    try {
      await streamServerClient.upsertUser({
        id: user.id.toString(),
        username: user.username || `user_${user.id}`,
        name: user.displayName || "Unknown",
      });
    } catch (err) {
      console.error("Failed to upsert Stream user:", err);
    }

    // Fetch unread counts
    [unreadNotificationsCount, unreadMessagesCount] = await Promise.all([
      prisma.notification.count({
        where: {
          recipient: { id: Number(user.id) },
          read: false,
        },
      }),
      streamServerClient
        .getUnreadCount(user.id.toString())
        .then((res) => res.total_unread_count),
    ]);
  }

  return (
    <div className={className}>
      {user && <SwitchProfile user={user} />}
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3 mb-2 hover:bg-primary hover:text-white"
        title="Home"
        asChild
      >
        <Link href="/">
          <Home className="w-16 h-16 flex-shrink-0" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>

      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3 mb-2 hover:bg-primary hover:text-white"
        title="Posts"
        asChild
      >
        <Link href="/posts">
          <FileText className="w-16 h-16 flex-shrink-0" />
          <span className="hidden lg:inline">Posts</span>
        </Link>
      </Button>

      {user && (
        <>
          <NotificationsButton
            initialState={{ unreadCount: unreadNotificationsCount }}
          />
          <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />

          <Button
            variant="ghost"
            className="flex items-center justify-start gap-3 mb-2 hover:bg-primary hover:text-white"
            title="Bookmarks"
            asChild
          >
            <Link href="/bookmarks">
              <Bookmark size={30} />
              <span className="hidden lg:inline">Bookmarks</span>
            </Link>
          </Button>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 text-sm p-3 rounded-lg bg-gray-50">
              <span className="text-xs font-mono text-muted-foreground break-all">
                User ID: {user.id}
              </span>
            </div>
            <LogOutButton />
          </div>
        </>
      )}
    </div>
  );
};
