import { TrendsSidebar } from "@/components/common/trends-sidebar";
import { PostDetails } from "@/components/posts/post-details";
import { Metadata } from "next";
interface PostPageProps {
  params: Promise<{ postId: string }>;
}
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { postId } = await params;
  return {
    title: `Post Details - ${postId}`,
  };
}

export default async function PostDetailsPage({ params }: PostPageProps) {
  const { postId } = await params;
  return (
    <main className="w-full flex flex-col lg:flex-row gap-5">
      {/* Main posts feed */}
      <div className="flex-1 min-w-0">
        <PostDetails postId={postId} />
      </div>
      <div className="hidden xl:block w-72 flex-none">
        <TrendsSidebar />
      </div>
    </main>
  );
}
