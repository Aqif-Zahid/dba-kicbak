import { TrendsSidebar } from "@/components/common/trends-sidebar";
import { UserPosts } from "@/components/posts/user-posts";
import { UserProfile } from "@/components/username/user-profile";
import { ExtendedProfile } from "@/types/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

interface PageProps {
  params: Promise<{ username: string }>;
}
const getUser = cache(async (username: string) => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002";
  const res = await fetch(`${base}/api/public/profiles/${encodeURIComponent(username)}`, {
    // don't cache per-user profile pages during dev
    cache: "no-store",
  });

  if (!res.ok) notFound();

  const json = await res.json();
  return json.data as ExtendedProfile;
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
const user = await getUser(username);
  return {
    title: `${user.displayName} (@${user.username})`,
  };
}

export default async function UserNamePage({ params }: PageProps) {
  const { username } = await params;
  const user = await getUser(username);
return (
    <main className="w-full min-w-0 flex gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile user={user} loggedInProfileId={0} />
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user.displayName}&apos; posts
          </h2>
        </div>
        <UserPosts profileId={user.id} />
      </div>
      <TrendsSidebar />
    </main>
  );
}
