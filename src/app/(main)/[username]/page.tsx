import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TrendsSidebar } from "@/components/common/trends-sidebar";
import { UserPosts } from "@/components/posts/user-posts";
import { UserProfile } from "@/components/username/user-profile";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { cache } from "react";

interface PageProps {
  params: Promise<{ username: string }>;
}
const getUser = cache(async (username: string) => {
  const user = await prisma.profiles.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
  });
  if (!user) {
    notFound();
  }
  return user;
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user;
  if (!loggedInUser) {
    return {};
  }
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
        <UserProfile user={user} loggedInUserId={1} />
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user.displayName}&apos; posts
          </h2>
        </div>
        {/* <UserPosts userId={user.id} /> */}
      </div>
      {/* <TrendsSidebar /> */}
    </main>
  );
}
