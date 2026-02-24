import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { getApiBaseUrl } from "@/lib/server-session";
import { UserButton } from "./user-button";
import { SignInButton } from "./sign-in-button";
import { NotificationsButton } from "../notifications/notifications-button";
import { MessagesButton } from "../messages/messages-button";
import { Bookmark, PlusSquare } from "lucide-react";
import { MobileMenuButton } from "./mobile-menu-button";
import { SearchField } from "./search-field";
import { ThemeToggle } from "./theme-toggle";
import { FaCommentDots } from "react-icons/fa6";

import { RewardsSection } from "./rewards-section";

interface HeaderProps {
  user: any;
}

export const Header = async ({ user }: HeaderProps) => {
  let unreadNotificationsCount = 0;
  let unreadMessagesCount = 0;

  if (user) {
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/header/unread-counts`, {
        cache: "no-store",
        headers: { cookie: headers().get("cookie") ?? "" },
      });

      if (res.ok) {
        const json = await res.json();
        unreadNotificationsCount = json?.data?.unreadNotificationsCount ?? 0;
        unreadMessagesCount = json?.data?.unreadMessagesCount ?? 0;
      }
    } catch (err) {
      console.error("Failed to load header counts:", err);
    }
  }

  return (
    <header className="border-b border-border relative z-50">
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
          <SearchField />
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
              >
                <PlusSquare size={20} className="mr-2" /> Create
              </Link>

              <NotificationsButton
                initialState={{ unreadCount: unreadNotificationsCount }}
              />

              {/* Points badge + rewards dialog (client) */}
              <RewardsSection user={user} />

              <UserButton className="ml-4" />
            </>
          ) : (
            <>
              <Link
                href="/posts"
                className="relative flex items-center text-sm font-bold justify-center w-25 h-11 rounded-full 
                text-gray-900 transition-colors hover:bg-gray-200"
              >
                <FaCommentDots size={20} className="mr-2 text-primary" /> Posts
              </Link>
              <ThemeToggle />
              <SignInButton />
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <MobileMenuButton
          user={user}
          unreadNotificationsCount={unreadNotificationsCount}
          unreadMessagesCount={unreadMessagesCount}
        />
      </div>
    </header>
  );
};
