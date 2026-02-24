import { getServerSessionFromApi } from "@/lib/server-session";

import { Benefits } from "@/components/home/benefits";
import { HeroSection } from "@/components/home/hero-section";
import { TrendsSidebar } from "@/components/common/trends-sidebar";
import { ForYouFeed } from "@/components/home/for-you-feed";
import { Comparisons } from "@/components/home/comparisons";

export default async function HomePage() {
  const session = await getServerSessionFromApi();
  const isSignedIn = !!session?.user;

  return (
    <>
      {isSignedIn ? (
        <main className="w-full flex flex-col lg:flex-row gap-5">
          {/* Main posts feed */}
          <div className="flex-1 min-w-0">
            <ForYouFeed />
          </div>
          <div className="hidden xl:block w-72 flex-none">
            <TrendsSidebar />
          </div>
        </main>
      ) : (
        <div className="w-full flex flex-col gap-10">
          <HeroSection />
          <Benefits />
          <Comparisons />
        </div>
      )}
    </>
  );
}
