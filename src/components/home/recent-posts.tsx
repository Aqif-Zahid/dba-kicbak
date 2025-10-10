import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sidebar } from "./side-bar";
import { useEffect, useState } from "react";
import axios from "axios";
import { ProfileCompletionModal } from "../modals/profile-completion-modal";
import { useRouter } from "next/navigation";
interface RecentPostsProps {
  isSignedIn: boolean;
  userStatus: string;
}
export const RecentPosts = ({ isSignedIn, userStatus }: RecentPostsProps) => {
  const router = useRouter();
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  // Fetch recent posts for signed-in users
  useEffect(() => {
    if (isSignedIn && userStatus === "ACTIVE") {
      axios
        .get("/api/posts?limit=10")
        .then((res) => setRecentPosts(res.data.posts ?? []))
        .catch((err) => console.error("Failed to load recent posts:", err));
    }
  }, [isSignedIn, userStatus]);

  // 2️⃣ Pending users must complete profile
  if (isSignedIn && userStatus === "PENDING") {
    return <ProfileCompletionModal isOpen={true} onClose={() => {}} />;
  }

  return (
    <div className="flex w-full min-h-[calc(100vh-64px)]">
      <div className="hidden lg:block w-[280px] border-r border-gray-200 sticky top-0 h-full">
        <Sidebar />
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Recent Discussions
        </h1>
        {recentPosts.length === 0 ? (
          <p className="text-gray-500">No posts available yet.</p>
        ) : (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <Card
                key={post.id}
                className="border border-gray-200 hover:shadow-sm transition cursor-pointer"
                onClick={() => router.push(`/posts/${post.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {post.title}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Posted by{" "}
                    <strong>{post.authorDisplayName || "User"}</strong> on{" "}
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Unknown Date"}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 line-clamp-2">{post.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
