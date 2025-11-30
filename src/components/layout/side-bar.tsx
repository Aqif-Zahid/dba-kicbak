import { headers } from "next/headers";
import {
  Home,
  FileText,
  Hourglass,
  UserCog,
  LockKeyhole,
  LayoutGrid,
  ListTree,
  MessageCircle,
  Plus,
  GiftIcon,
  Receipt,
} from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import LogOutButton from "./log-out-button";
import { SwitchProfile } from "./switch-profile";
import { FaUserGroup } from "react-icons/fa6";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

interface MenubarProps {
  className?: string;
  user: any;
}

export const Sidebar = async ({ className, user }: MenubarProps) => {
  const isAdmin = user && user.role === "ADMIN";

  const headersList = await headers();
  const url =
    headersList.get("x-invoke-path") || headersList.get("referer") || "/";

  return (
    <div className={className}>
      <div className="hidden md:block">
        {user && <SwitchProfile user={user} />}
      </div>

      {/* ================= Home ================= */}
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

      {/* ================= Posts ================= */}
      <Button
        variant={url.includes("/posts") ? "default" : "ghost"}
        className="flex items-center justify-start gap-3 mb-2 hover:bg-primary hover:text-white"
        title="Posts"
        asChild
      >
        <Link href="/posts">
          <FileText className="w-16 h-16 flex-shrink-0" />
          <span className="hidden lg:inline">Posts</span>
        </Link>
      </Button>

      {/* ================= Admin Section ================= */}
      {isAdmin && (
        <>
          {/* Manage Users */}
          <Button
            variant={url.includes("/admin/users") ? "default" : "ghost"}
            className="flex items-center justify-start gap-3 mb-2 hover:bg-primary hover:text-white"
            title="Manage Users"
            asChild
          >
            <Link href="/admin/users">
              <FaUserGroup className="w-16 h-16 flex-shrink-0" />
              <span className="hidden lg:inline">Manage Users</span>
            </Link>
          </Button>

          {/* Pending Invites */}
          <Button
            variant={url.includes("/admin/pending-invites") ? "default" : "ghost"}
            className="flex items-center justify-start gap-3 mb-2 hover:bg-primary hover:text-white"
            title="Pending Invites"
            asChild
          >
            <Link href="/admin/pending-invites">
              <Hourglass className="w-16 h-16 flex-shrink-0" />
              <span className="hidden lg:inline">Pending Invites</span>
            </Link>
          </Button>

          {/* Configure Rewards */}
          <Button
            variant={url.includes("/admin/configure-rewards") ? "default" : "ghost"}
            className="flex items-center justify-start gap-3 mb-2 hover:bg-primary hover:text-white"
            title="Configure Rewards"
            asChild
          >
            <Link href="/admin/configure-rewards">
              <GiftIcon className="w-16 h-16 flex-shrink-0" />
              <span className="hidden lg:inline">Configure Rewards</span>
            </Link>
          </Button>
        </>
      )}

      {/* ================= Communities ================= */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="community">
          <AccordionTrigger className="px-3 py-2 rounded-lg hover:no-underline">
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-4 h-4 flex-shrink-0" />
              <span className="hidden lg:inline">Communities</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pl-10 flex flex-col space-y-2">
            <Button
              variant={url.includes("/communities/create") ? "default" : "ghost"}
              className="justify-start hover:bg-primary hover:text-white"
              asChild
            >
              <Link href="/communities/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Communities
              </Link>
            </Button>
            <Button
              variant={url.includes("/admin/communities") ? "default" : "ghost"}
              className="justify-start hover:bg-primary hover:text-white"
              asChild
            >
              <Link href="/communities">
                <ListTree className="w-4 h-4 mr-2" />
                Manage Communities
              </Link>
            </Button>
            {isAdmin && (
              <>
                <Button
                  variant={url.includes("/admin/topic-groups") ? "default" : "ghost"}
                  className="justify-start hover:bg-primary hover:text-white"
                  asChild
                >
                  <Link href="/admin/topic-groups">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Topic Groups
                  </Link>
                </Button>
                <Button
                  variant={url.includes("/admin/topics") ? "default" : "ghost"}
                  className="justify-start hover:bg-primary hover:text-white"
                  asChild
                >
                  <Link href="/admin/topics">
                    <FileText className="w-4 h-4 mr-2" />
                    Topics
                  </Link>
                </Button>
              </>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* ================= User Section ================= */}
      {user && (
        <>
          <div className="md:pt-4 border-t border-gray-200">
            <div className="hidden md:flex items-center space-x-3 text-sm p-3 rounded-lg bg-gray-50">
              <span className="text-xs font-mono text-muted-foreground break-all">
                User ID: {user.id}
              </span>
            </div>

            <Button
              variant={url.includes("/user/profiles") ? "default" : "ghost"}
              className="flex items-center justify-start gap-3 my-2 hover:bg-primary hover:text-white"
              title="Profiles"
              asChild
            >
              <Link href="/user/profiles">
                <UserCog className="w-16 h-16 flex-shrink-0" />
                <span className="hidden lg:inline">Manage Profiles</span>
              </Link>
            </Button>

            {/* ===== View Ledger (added) ===== */}
            <Button
              variant={url.includes("/rewards/ledger") ? "default" : "ghost"}
              className="flex items-center justify-start gap-3 my-2 hover:bg-primary hover:text-white"
              title="View Ledger"
              asChild
            >
              <Link href="/rewards/ledger">
                <Receipt className="w-16 h-16 flex-shrink-0" />
                <span className="hidden lg:inline">View Ledger</span>
              </Link>
            </Button>

            <Button
              variant={url.includes("/user/change-password") ? "default" : "ghost"}
              className="flex items-center justify-start gap-3 my-2 hover:bg-primary hover:text-white"
              title="Change Password"
              asChild
            >
              <Link href="/user/change-password">
                <LockKeyhole className="w-16 h-16 flex-shrink-0" />
                <span className="hidden lg:inline">Change Password</span>
              </Link>
            </Button>

            <LogOutButton />
          </div>
        </>
      )}
    </div>
  );
};
