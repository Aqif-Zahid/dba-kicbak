import Link from "next/link";
import { headers } from "next/headers";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { UserAvatar } from "./user-avatar";
import { FollowButton } from "../followers/follow-button";
import { UserTooltip } from "../username/user-tooltip";
import { formatNumber } from "@/lib/utils";
import { getApiBaseUrl } from "@/lib/server-session";

export const TrendsSidebar = () => {
  return (
    <div className="sticky top-[5.5rem] hidden md:block lg:w-80 w-72 h-fit flex-none space-y-5">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <WhoToFollow />
        <TrendingTopics />
      </Suspense>
    </div>
  );
};

const WhoToFollow = async () => {
  const base = getApiBaseUrl();

  const res = await fetch(`${base}/api/trends/who-to-follow`, {
    cache: "no-store",
    headers: { cookie: headers().get("cookie") ?? "" },
  });

  // Not signed in -> hide this card
  if (!res.ok) return null;

  const json = await res.json();
  const profiles = json?.data ?? [];

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Follow</div>
      {profiles.map((profile: any) => (
        <div
          key={profile.id}
          className="flex items-center justify-between gap-3"
        >
          <UserTooltip profile={profile}>
            <Link
              href={`/${profile.username}`}
              className="flex items-center gap-3"
            >
              <UserAvatar
                avatarUrl={profile.profilePicture}
                avatarFallback={profile.username.toUpperCase().charAt(0)}
                className="flex-none"
              />
              <div>
                <p className="line-clamp-1 font-semibold hover:underline">
                  {profile.displayName}
                </p>
                <p className="line-clamp-1 text-muted-foreground">
                  @{profile.username}
                </p>
              </div>
            </Link>
          </UserTooltip>
          <FollowButton
            profileId={profile.id}
            initialState={{
              followers: profile._count?.followers ?? 0,
              isFollowedByUser: !!profile.isFollowedByUser,
            }}
          />
        </div>
      ))}
    </div>
  );
};

const TrendingTopics = async () => {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/trends/topics`, { cache: "no-store" });

  const json = res.ok ? await res.json() : { data: [] };
  const trendingTopics = json?.data ?? [];

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Trending Now</div>
      {trendingTopics.map(({ hashtag, count }: any) => {
        const title = String(hashtag).replace("#", "");
        return (
          <Link key={title} href={`/hashtag/${title}`} className="block">
            <p
              className="line-clamp-1 font-semibold hover:underline break-all"
              title={hashtag}
            >
              {hashtag}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatNumber(count)} {count === 1 ? "post" : "posts"}
            </p>
          </Link>
        );
      })}
    </div>
  );
};
