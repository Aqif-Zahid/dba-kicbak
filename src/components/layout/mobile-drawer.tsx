"use client";

import { useState } from "react";
import Link from "next/link";
import { MessagesButton } from "../messages/messages-button";
import { NotificationsButton } from "../notifications/notifications-button";
import { Button } from "../ui/button";
import { Bookmark, ChevronDown, ChevronUp, X } from "lucide-react";
import { UserButton } from "./user-button";
import { SignInButton } from "./sign-in-button";

interface MobileDrawerProps {
  user: any;
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  onClose: () => void;
}

export const MobileDrawer = ({
  user,
  unreadNotificationsCount,
  unreadMessagesCount,
  onClose,
}: MobileDrawerProps) => {
  const [messagesOpen, setMessagesOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(true);
  const [bookmarksOpen, setBookmarksOpen] = useState(true);

  return (
    <div className="fixed inset-0 z-40">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="absolute top-0 right-0 h-full w-64 bg-white shadow-lg p-4 transform transition-transform duration-300 translate-x-0 flex flex-col gap-4">
        <button className="self-end p-2" onClick={onClose} title="Close menu">
          <X size={24} />
        </button>

        <Link href="/" className="text-lg font-semibold mb-4" onClick={onClose}>
          Home
        </Link>

        {user ? (
          <>
            {/* Messages */}
            <div className="flex flex-col gap-1">
              <button
                className="flex justify-between items-center w-full text-left font-medium"
                onClick={() => setMessagesOpen(!messagesOpen)}
              >
                Messages{" "}
                {messagesOpen ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>
              {messagesOpen && (
                <MessagesButton
                  initialState={{ unreadCount: unreadMessagesCount }}
                />
              )}
            </div>

            {/* Bookmarks */}
            <div className="flex flex-col gap-1">
              <button
                className="flex justify-between items-center w-full text-left font-medium"
                onClick={() => setBookmarksOpen(!bookmarksOpen)}
              >
                Bookmarks{" "}
                {bookmarksOpen ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>
              {bookmarksOpen && (
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 hover:bg-primary hover:text-white"
                  asChild
                >
                  <Link href="/bookmarks" onClick={onClose}>
                    <Bookmark size={30} />
                  </Link>
                </Button>
              )}
            </div>

            {/* Notifications */}
            <div className="flex flex-col gap-1">
              <button
                className="flex justify-between items-center w-full text-left font-medium"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                Notifications{" "}
                {notificationsOpen ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>
              {notificationsOpen && (
                <NotificationsButton
                  initialState={{ unreadCount: unreadNotificationsCount }}
                />
              )}
            </div>

            <UserButton />
          </>
        ) : (
          <SignInButton />
        )}
      </div>
    </div>
  );
};
