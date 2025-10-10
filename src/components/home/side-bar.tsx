"use client";

import { useSession } from "next-auth/react";
import { LogOut, User, Users, ChevronDown, Check } from "lucide-react";
import { Button } from "../ui/button";
import { signOut, signIn } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// === Profile Switch Functionality ===
const switchProfile = async (newProfileId: string) => {
  try {
    const res = await axios.post("/api/auth/switch-profile", {
      newProfileId,
    });

    if (res.data.status === 1) {
      await signIn("refresh", {
        redirect: false,
        activeProfileId: newProfileId,
      });
      toast.success("Profile switched successfully!");
    }
  } catch (error) {
    console.error("Failed to switch profile:", error);
    toast.error("Failed to switch profile. Please try again.");
  }
};

export const Sidebar = () => {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const user = session?.user;
  const currentProfile = user;
  const allProfiles = (session?.user as any)?.allProfiles || [];

  // --- For signed-in users ---
  const otherProfiles = allProfiles.filter(
    (p: any) => p.profileId !== currentProfile?.id
  );

  const profilesForMenu = [
    ...(currentProfile
      ? [
          {
            profileId: currentProfile.id,
            username: currentProfile.username,
            profilePicture: currentProfile.profilePicture,
            profileName: currentProfile.displayName,
            role: currentProfile.role,
          },
        ]
      : []),
    ...otherProfiles,
  ].filter((v, i, a) => a.findIndex((t) => t.profileId === v.profileId) === i);

  const handleSwitch = (profileId: string) => {
    setIsMenuOpen(false);
    if (profileId !== currentProfile?.id) {
      switchProfile(profileId);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4 bg-white shadow-sm">
      {/* --- Profile Switcher --- */}
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between items-center rounded-xl p-3 h-auto shadow-sm transition-all hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                {currentProfile?.username ? (
                  currentProfile.username[0].toUpperCase()
                ) : (
                  <User size={18} />
                )}
              </div>
              <div className="flex flex-col items-start truncate">
                <span className="font-semibold text-sm truncate max-w-[120px]">
                  {currentProfile?.username || "Loading..."}
                </span>
                <span className="text-xs text-muted-foreground">
                  {currentProfile?.role || "Traveler"}
                </span>
              </div>
            </div>
            <ChevronDown
              size={18}
              className={cn(
                "transition-transform duration-200",
                isMenuOpen && "rotate-180"
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[280px] p-2" align="start">
          <DropdownMenuLabel className="flex items-center text-sm font-semibold text-gray-700">
            <Users size={16} className="mr-2" /> Switch Profile
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {profilesForMenu.map((profile: any) => (
            <DropdownMenuItem
              key={`${profile.profileId || "no-id"}-${profile.username || ""}`}
              onClick={() => handleSwitch(profile.profileId)}
              className={cn(
                "flex items-center space-x-3 cursor-pointer p-2 rounded-lg",
                profile.profileId === currentProfile?.id &&
                  "bg-blue-50 text-primary font-medium"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-white",
                  profile.profileId === currentProfile?.id
                    ? "bg-primary"
                    : "bg-gray-400"
                )}
              >
                {profile.username ? (
                  profile.username[0].toUpperCase()
                ) : (
                  <User size={16} />
                )}
              </div>
              <div className="flex flex-col items-start truncate flex-1">
                <span className="text-sm font-medium truncate max-w-[150px]">
                  {profile.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {profile.role}
                </span>
              </div>
              {profile.profileId === currentProfile?.id && (
                <Check size={16} className="text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* --- Main Navigation Links --- */}
      <nav className="space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start text-base rounded-xl"
          onClick={() => router.push("/")}
        >
          Home
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-base rounded-xl"
          onClick={() => router.push("/posts")}
        >
          View Posts
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-base rounded-xl"
        >
          Rewards Ledger
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-base rounded-xl"
        >
          Settings
        </Button>
      </nav>

      {/* --- Logout Section (Moved Up) --- */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 text-sm p-3 rounded-lg bg-gray-50">
          <span className="text-xs font-mono text-muted-foreground break-all">
            User ID: {user?.id}
          </span>
        </div>
        <Button
          onClick={() => signOut({ callbackUrl: "/" })}
          variant="ghost"
          className="w-full justify-start text-base rounded-xl mt-2 text-red-600 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut size={20} className="mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
};
