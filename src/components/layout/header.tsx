import Image from "next/image";
import Link from "next/link";
import { UserButton } from "./user-button";
import { SignInButton } from "./sign-in-button";
import { NotificationsButton } from "../notifications/notifications-button";
import { MessagesButton } from "../messages/messages-button";
import { Bookmark, Menu, PlusSquare } from "lucide-react";
import streamServerClient from "@/lib/stream";
import prisma from "@/lib/prisma";
import { MobileMenuButton } from "./mobile-menu-button";

interface HeaderProps {
  user: any;
}

export const Header = async ({ user }: HeaderProps) => {
  let unreadNotificationsCount = 0;
  let unreadMessagesCount = 0;

  if (user) {
    try {
      await streamServerClient.upsertUser({
        id: user.defaultProfileId.toString(),
        username: user.username || `user_${user.defaultProfileId}`,
        name: user.displayName || "Unknown",
      });
    } catch (err) {
      console.error("Failed to upsert Stream user:", err);
    }

    [unreadNotificationsCount, unreadMessagesCount] = await Promise.all([
      prisma.notification.count({
        where: {
          recipient: { id: Number(user.defaultProfileId) },
          read: false,
        },
      }),
      streamServerClient
        .getUnreadCount(user.defaultProfileId.toString())
        .then((res) => res.total_unread_count),
    ]);
  }

  return (
    <header className="border-b border-border relative z-50 fixed top-">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/kicbak-logo.png"
            alt="Kicbak"
            width={200}
            height={60}
            className="h-12 w-auto"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-x-4 items-center">
          {user ? (
            <>
              <Link
                href="/bookmarks"
                className="relative flex items-center justify-center w-11 h-11 rounded-full 
             text-muted-foreground transition-colors hover:bg-gray-200"
                title="Bookmarks"
              >
                <Bookmark size={20} />
              </Link>
              <MessagesButton
                initialState={{ unreadCount: unreadMessagesCount }}
              />
              <Link
                href="/posts/create"
                className="relative flex items-center text-sm font-bold justify-center w-25 h-11 rounded-full 
             text-gray-900 transition-colors hover:bg-gray-200"
                title="Bookmarks"
              >
                <PlusSquare size={20} className="mr-2" /> Create
              </Link>
              <NotificationsButton
                initialState={{ unreadCount: unreadNotificationsCount }}
              />
              <UserButton className="ml-4" />
            </>
          ) : (
            <SignInButton />
          )}
        </div>

        {/* Mobile Menu Button */}
        <MobileMenuButton
          user={user}
          unreadNotificationsCount={unreadNotificationsCount}
          unreadMessagesCount={unreadMessagesCount}
        />
      </div>
    </header>
  );
};
