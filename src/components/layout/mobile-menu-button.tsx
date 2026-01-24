"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { MobileDrawer } from "./mobile-drawer";
import { User } from "@/types/types";

export const MobileMenuButton = ({
  user,
  unreadNotificationsCount,
  unreadMessagesCount,
}: {
  user: User;
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <>
      <button
        className="md:hidden p-2 rounded-md hover:bg-gray-100"
        onClick={() => setDrawerOpen(true)}
      >
        <Menu size={24} />
      </button>
      {drawerOpen && (
        <MobileDrawer
          user={user}
          unreadNotificationsCount={unreadNotificationsCount}
          unreadMessagesCount={unreadMessagesCount}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </>
  );
};
