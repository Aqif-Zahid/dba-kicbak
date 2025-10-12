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
import { FollowerInfo, User } from "@/types/types";
import { useUser } from "@/providers/auth-provider";
import { UserAvatar } from "../common/user-avatar";
import { FollowButton } from "../followers/follow-button";
import { FollowerCount } from "./follower-count";

interface UserTooltipProps extends PropsWithChildren {
  user: User;
}

export const UserTooltip = ({ user, children }: UserTooltipProps) => {
  const { user: loggedInUser } = useUser();
  const followerState: FollowerInfo = {
    followers: user._count?.followers,
    isFollowedByUser: !!user.followers?.some(
      (follower) => follower.followerId === loggedInUser.id
    ),
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <div className="flex max-w-80 flex-col gap-3 break-words pax-1 py-2.5 md:min-w-52">
            <div className="flex justify-between items-center gap-2">
              <Link href={`/users/${user.username}`}>
                <UserAvatar
                  size={70}
                  avatarUrl={user.profilePicture}
                  avatarFallback={
                    user.displayName?.charAt(0).toUpperCase() || "U"
                  }
                />
              </Link>
              {loggedInUser?.id !== String(user.id) && (
                <FollowButton userId={user.id} initialState={followerState} />
              )}
            </div>
            <div>
              <Link href={`/users/${user.username}`}>
                <div className="text-lg font-semibold hover:underline">
                  {user.displayName}
                </div>
                <div className="text-muted-foreground">@{user.username}</div>
              </Link>
            </div>
            {user.bio && (
              <Linkify>
                <div className="line-clamp-4 whitespace-pre-line">
                  {user.bio}
                </div>
              </Linkify>
            )}
            <FollowerCount userId={user.id} initialState={followerState} />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
