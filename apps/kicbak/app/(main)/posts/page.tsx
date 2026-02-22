import { TrendsSidebar } from "@/components/common/trends-sidebar";
import { ForYouFeed } from "@/components/home/for-you-feed";

export default function PostsPage() {
  return (
    <main className="w-full flex flex-col lg:flex-row gap-5">
      {/* Main posts feed */}
      <div className="flex-1 min-w-0">
        <ForYouFeed />
      </div>
      <div className="hidden xl:block w-72 flex-none">
        <TrendsSidebar />
      </div>
    </main>
  );
}
