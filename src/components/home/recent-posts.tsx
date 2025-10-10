import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";

export const RecentPosts = () => {
  const router = useRouter();
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  return (
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
                  Posted by <strong>{post.authorDisplayName || "User"}</strong>{" "}
                  on{" "}
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
  );
};
