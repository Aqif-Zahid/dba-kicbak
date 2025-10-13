import { ExtendedProfile, FollowerInfo } from "@/types/types";
import { format } from "date-fns";
import { UserAvatar } from "../common/user-avatar";
import { formatNumber } from "@/lib/utils";
import { Linkify } from "./linkify";
import { FollowerCount } from "./follower-count";
import { FollowButton } from "../followers/follow-button";
import { EditProfileButton } from "./edit-profile-button";

interface UserProfileProps {
  user: ExtendedProfile;
  loggedInProfileId?: number;
}
export const UserProfile = async ({
  user,
  loggedInProfileId,
}: UserProfileProps) => {
  const { displayName } = user;
  const avatarFallback =
    displayName?.charAt(0).toUpperCase() ||
    user.user.email?.charAt(0).toUpperCase() ||
    "U";

  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      (follower) => follower.followerId === loggedInProfileId
    ),
  };

  console.log(user, loggedInProfileId);
  return (
    <div className="h-fit w-full space-y-5 rounded-2xl bg-card p-5">
      <UserAvatar
        avatarUrl={user.profilePicture}
        size={250}
        avatarFallback={avatarFallback}
        className="mx-auto size-full max-h-60 max-w-60 rounded-full"
      />
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          <div>
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <div className="text-muted-foreground">@{user.username}</div>
          </div>
          <div>
            Member since{" "}
            {user.createdAt ? format(user.createdAt, "MMM d, yyyy") : "Unknown"}
          </div>
          <div className="flex items-center gap-3">
            <span>
              Posts :{" "}
              <span className="font-semibold">
                {formatNumber(user._count.posts)}
              </span>
            </span>
            <FollowerCount profileId={user.id} initialState={followerInfo} />
          </div>
        </div>
        {user.id === loggedInProfileId ? (
          <EditProfileButton user={user} />
        ) : (
          <FollowButton userId={user.id} initialState={followerInfo} />
        )}
      </div>
      {user.bio && (
        <>
          <hr />
          <Linkify>
            <div className="whitespace-pre-line overflow-hidden break-words">
              {user.bio}
            </div>
          </Linkify>
        </>
      )}
    </div>
  );
};
