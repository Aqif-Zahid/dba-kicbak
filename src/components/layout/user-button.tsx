"use client";

import { Loader, LogOut, Settings, Key, User, Hourglass } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/providers/auth-provider";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaUserGroup } from "react-icons/fa6";

export const UserButton = () => {
  const { user, loading, logout } = useUser();

  const handleLogout = () => {
    logout();
    // window.location.reload();
  };

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
        <Loader className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const { displayName, email, role, username } = user;
  const avatarFallback = displayName
    ? displayName.charAt(0).toUpperCase()
    : email.charAt(0).toUpperCase() ?? "U";

  const isAdmin = user && role === "ADMIN";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative">
        <Avatar className="w-10 h-10 border border-neutral-300 hover:opacity-80 transition">
          <AvatarFallback className="bg-neutral-200 text-neutral-500 font-medium flex items-center justify-center">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent asChild sideOffset={10} align="end">
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-60 rounded-xl shadow-lg border border-neutral-200 bg-white p-2"
        >
          {/* User Info */}
          <div className="flex flex-col items-center justify-center py-4 border-b border-neutral-100 mb-2">
            <Avatar className="w-14 h-14 border border-neutral-300 mb-2">
              <AvatarFallback className="bg-neutral-200 text-xl font-medium text-neutral-500 flex justify-center items-center">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-semibold text-neutral-900">
              {displayName || "User"}
            </p>
            <p className="text-xs text-neutral-500 truncate max-w-full">
              {email}
            </p>
          </div>

          {/* Dropdown Items */}
          <Link href={isAdmin ? "/admin" : `/${username}`}>
            <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-emerald-50 cursor-pointer">
              <User className="w-4 h-4 text-primary" />
              Profile
            </DropdownMenuItem>
          </Link>
          {isAdmin && (
            <>
              <Link href="/admin/users">
                <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-emerald-50 cursor-pointer">
                  <FaUserGroup className="w-4 h-4 text-primary" />
                  Manage Users
                </DropdownMenuItem>
              </Link>
              <Link href="/admin/pending-invites">
                <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-emerald-50 cursor-pointer">
                  <Hourglass className="w-4 h-4 text-primary" />
                  Pending Invites
                </DropdownMenuItem>
              </Link>
            </>
          )}

          <Link href="/change-password">
            <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-emerald-50 cursor-pointer">
              <Key className="w-4 h-4 text-primary" />
              Change Password
            </DropdownMenuItem>
          </Link>

          <DropdownMenuItem
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-red-50 text-red-600 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
