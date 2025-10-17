import prisma from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { UserAvatar } from "./user-avatar";
import { FollowButton } from "../followers/follow-button";
import { UserTooltip } from "../username/user-tooltip";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCurrentProfileId } from "@/helpers/get-current-user-id";
import { unstable_cache } from "next/cache";
import { formatNumber } from "@/lib/utils";

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
  const session = await getServerSession(authOptions);
  const profileId = getCurrentProfileId(session);
  if (!profileId) return null;

  const currentProfileId = Number(profileId);

  const usersToFollow = await prisma.profiles.findMany({
    where: {
      NOT: { id: currentProfileId },
      followers: { none: { followerId: currentProfileId } },
    },
    select: {
      id: true,
      userId: true,
      role: true,
      username: true,
      displayName: true,
      profilePicture: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
      followers: { select: { followerId: true } },
      _count: { select: { followers: true, posts: true } },
    },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  // Map to ProfileResponse type
  const profiles = usersToFollow.map((u) => ({
    id: u.id,
    userId: u.userId,
    role: u.role,
    username: u.username,
    displayName: u.displayName,
    profilePicture: u.profilePicture,
    bio: u.bio,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    followers: u.followers,
    _count: { followers: u._count.followers },
  }));

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Follow</div>
      {profiles.map((profile) => (
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
                avatarFallback={profile.username.charAt(0)}
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
              followers: profile._count.followers,
              isFollowedByUser: profile.followers.some(
                ({ followerId }) => followerId === Number(profileId)
              ),
            }}
          />
        </div>
      ))}
    </div>
  );
};

const getTrendingTopics = unstable_cache(
  async () => {
    const result = await prisma.$queryRawUnsafe<
      { hashtag: string; count: bigint }[]
    >(`
      SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag,
             COUNT(*) AS count
      FROM posts
      GROUP BY hashtag
      ORDER BY count DESC, hashtag ASC
      LIMIT 5;
    `);

    return result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count),
    }));
  },
  ["trending_topics"],
  { revalidate: 3 * 60 * 60 }
);

const TrendingTopics = async () => {
  const trendingTopics = await getTrendingTopics();

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Trending Now</div>
      {trendingTopics.map(({ hashtag, count }) => {
        const title = hashtag.replace("#", "");
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
