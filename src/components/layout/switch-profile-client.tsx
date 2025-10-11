"use client";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import axios from "axios";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Check, ChevronDown, UserIcon, Users } from "lucide-react";
import { Profile, User } from "@/types/types";

interface SwitchProfileClientProps {
  user: User;
  profiles: Profile[];
}

export const SwitchProfileClient = ({
  user,
  profiles,
}: SwitchProfileClientProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentProfile = profiles.find(
    (profile) => profile.id === user.defaultProfileId
  );

  const handleSwitch = (profileId: number) => {
    setIsMenuOpen(false);
    if (profileId !== currentProfile?.id) {
      switchProfile(profileId);
    }
  };

  const switchProfile = async (newProfileId: number) => {
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
  return (
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
                <UserIcon size={18} />
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

        {profiles.map((profile: Profile) => (
          <DropdownMenuItem
            key={`${profile.id || "no-id"}-${profile.username || ""}`}
            onClick={() => handleSwitch(profile.id)}
            className={cn(
              "flex items-center space-x-3 cursor-pointer p-2 rounded-lg",
              profile.id === currentProfile?.id &&
                "bg-blue-50 text-primary font-medium"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-white",
                profile.id === currentProfile?.id ? "bg-primary" : "bg-gray-400"
              )}
            >
              {profile.username ? (
                profile.username[0].toUpperCase()
              ) : (
                <UserIcon size={16} />
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
            {profile.id === currentProfile?.id && (
              <Check size={16} className="text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
