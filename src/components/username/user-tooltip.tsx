"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { Linkify } from "./linkify";
import { FollowerInfo } from "@/types/types";
import { useUser } from "@/providers/auth-provider";
import { UserAvatar } from "../common/user-avatar";
import { FollowButton } from "../followers/follow-button";
import { FollowerCount } from "./follower-count";
import { ProfileRole } from "@prisma/client";
type Follower = {
  followerId: number;
  followingId?: number; // optional if not always returned
};

type ProfileResponse = {
  id: number;
  userId: number;
  role: ProfileRole;
  bio: string | null;
  createdAt: Date | null;
  updatedAt: Date;
  username: string;
  displayName: string;
  profilePicture: string | null;
  followers: Follower[];
  _count: {
    followers: number;
  };
};
interface UserTooltipProps extends PropsWithChildren {
  profile: ProfileResponse;
}

export const UserTooltip = ({ profile, children }: UserTooltipProps) => {
  console.log(profile);
  const { user: loggedInUser } = useUser();
  const followerState: FollowerInfo = {
    // Use optional chaining and default to 0 if _count is missing
    followers: profile._count?.followers ?? 0,
    isFollowedByUser: !!profile.followers?.some(
      (follower) => follower.followerId === loggedInUser?.defaultProfileId
    ),
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <div className="flex max-w-80 flex-col gap-3 break-words pax-1 py-2.5 md:min-w-52">
            <div className="flex justify-between items-center gap-2">
              <Link href={`/users/${profile.username}`}>
                <UserAvatar
                  size={70}
                  avatarUrl={profile.profilePicture}
                  avatarFallback={
                    profile.displayName?.charAt(0).toUpperCase() || "U"
                  }
                />
              </Link>
              {loggedInUser?.id !== String(profile.id) && (
                <FollowButton
                  userId={profile.id}
                  initialState={followerState}
                />
              )}
            </div>
            <div>
              <Link href={`/users/${profile.username}`}>
                <div className="text-lg font-semibold hover:underline">
                  {profile.displayName}
                </div>
                <div className="text-muted-foreground">@{profile.username}</div>
              </Link>
            </div>
            {profile.bio && (
              <Linkify>
                <div className="line-clamp-4 whitespace-pre-line">
                  {profile.bio}
                </div>
              </Linkify>
            )}
            <FollowerCount
              profileId={profile.id}
              initialState={followerState}
            />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
