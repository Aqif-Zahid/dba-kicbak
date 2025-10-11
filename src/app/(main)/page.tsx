import { TravelBenefits } from "@/components/home/traveler-benefits";
import { HeroSection } from "@/components/home/hero-section";
import { RecentPosts } from "@/components/home/recent-posts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { TrendsSidebar } from "@/components/common/trends-sidebar";
import { ForYouFeed } from "@/components/home/for-you-feed";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isSignedIn = session?.user;

  return (
    <div>
      {isSignedIn ? (
        <main className="w-full min-w-0 flex gap-5">
          <div className="w-full min-w-0 space-y-5">
            {/* <PostEditor /> */}
            <Tabs defaultValue="for-you">
              <TabsList>
                <TabsTrigger value="for-you">For You</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
              </TabsList>
              <TabsContent value="for-you">
                <ForYouFeed />
              </TabsContent>
              <TabsContent value="following">
                {/* <FollowingFeed /> */}
              </TabsContent>
            </Tabs>
          </div>
          {/* <TrendsSidebar /> */}
        </main>
      ) : (
        <div className="w-full">
          <HeroSection />
          <TravelBenefits />
        </div>
      )}
    </div>
  );
}
