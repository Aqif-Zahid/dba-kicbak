"use client";

import Link from "next/link";
import { CircleUser, UserRoundCog } from "lucide-react";
import { RiCalendarScheduleFill, RiLockPasswordLine } from "react-icons/ri";
import { SiSamsclub } from "react-icons/si";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { TbLogs } from "react-icons/tb";
import { BsNewspaper } from "react-icons/bs";
import { FaUserGroup } from "react-icons/fa6";
import LogOutButton from "./log-out-button";
import { usePathname } from "next/navigation";
import { useUser } from "@/providers/auth-provider";

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const { user } = useUser();
  const isAdmin = user && user.role === "ADMIN";

  const pathname = usePathname();
  return (
    <div className={className}>
      <Button
        variant={pathname === "/admin" ? "default" : "ghost"}
        className="flex items-center justify-start gap-3 mb-2 hover:bg-primary hover:text-white"
        title="My Profile"
        asChild
      >
        <Link href="/admin">
          <CircleUser />
          <span className="hidden lg:inline">My Profile</span>
        </Link>
      </Button>

      {isAdmin && (
        <>
          <Button
            variant={pathname === "/admin/users" ? "default" : "ghost"}
            className="flex items-center justify-start gap-3 mb-2 hover:bg-primary hover:text-white"
            title="Manage Users"
            asChild
          >
            <Link href="/admin/users">
              <UserRoundCog />
              <span className="hidden lg:inline">Manage Users</span>
            </Link>
          </Button>
          <Button
            variant={
              pathname === "/admin/pending-invites" ? "default" : "ghost"
            }
            className="flex items-center justify-start gap-3 mb-2 hover:bg-primary hover:text-white"
            title="Pending Invites"
            asChild
          >
            <Link href="/admin/pending-invites">
              <SiSamsclub />
              <span className="hidden lg:inline">Pending Invites</span>
            </Link>
          </Button>
        </>
      )}
      <Button
        variant={pathname === "/change-password" ? "default" : "ghost"}
        className="flex items-center justify-start gap-3 hover:bg-primary hover:text-white mb-2"
        title="Change Password"
        asChild
      >
        <Link href="/change-password">
          <RiLockPasswordLine />
          <span className="hidden lg:inline">Change Password</span>
        </Link>
      </Button>
      <LogOutButton />
    </div>
  );
};
