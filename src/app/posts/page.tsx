"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/auth-provider";
import { useSigninModal } from "@/hooks/use-signin-modal";

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const router = useRouter();
  const { user } = useUser();
  const { open: openSigninModal } = useSigninModal();

  // ✅ Load all posts and then fetch bulk vote counts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const postRes = await axios.get("/api/posts");
        const fetchedPosts = postRes.data?.posts ?? [];

        if (fetchedPosts.length === 0) {
          setPosts([]);
          return;
        }

        // Collect all post IDs for bulk vote fetch
        const ids = fetchedPosts.map((p: any) => p.id).join(",");

        // Fetch vote data in bulk
        const voteRes = await axios.get(`/api/votes?postIds=${ids}`);
        const results = voteRes.data?.results ?? {};

        // Merge vote data into post objects
        const merged = fetchedPosts.map((p: any) => ({
          ...p,
          upvotes: results[p.id]?.upvotes ?? 0,
          downvotes: results[p.id]?.downvotes ?? 0,
          userVote: results[p.id]?.userVote ?? null,
        }));

        setPosts(merged);
      } catch (err) {
        console.error("Failed to load posts:", err);
      }
    };

    loadPosts();
  }, []);

  // ✅ Handles Like/Dislike
  const handleVote = async (postId: number, type: "UPVOTE" | "DOWNVOTE") => {
    if (!user) {
      openSigninModal();
      return;
    }

    try {
      const res = await axios.post("/api/votes", { postId, voteType: type });

      if (res.data?.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  upvotes: res.data.upvotes ?? p.upvotes,
                  downvotes: res.data.downvotes ?? p.downvotes,
                  userVote:
                    p.userVote === type
                      ? null
                      : (type as "UPVOTE" | "DOWNVOTE"),
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* ✅ Back to Home Button */}
      <Button
        variant="outline"
        onClick={() => router.push("/")}
        className="mb-2"
      >
        ← Back to Home
      </Button>

      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Community Discussions
      </h1>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        posts.map((post) => (
          <Card
            key={post.id}
            className="border border-gray-200 hover:shadow-sm transition"
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

            <CardContent className="space-y-3">
              <p className="text-gray-700">{post.content}</p>

              <div className="flex items-center gap-3">
                <Button
                  variant={
                    post.userVote === "UPVOTE" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleVote(post.id, "UPVOTE")}
                  className={
                    post.userVote === "UPVOTE"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "text-green-600 hover:bg-green-100"
                  }
                >
                  👍 {post.upvotes ?? 0}
                </Button>

                <Button
                  variant={
                    post.userVote === "DOWNVOTE" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleVote(post.id, "DOWNVOTE")}
                  className={
                    post.userVote === "DOWNVOTE"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "text-red-600 hover:bg-red-100"
                  }
                >
                  👎 {post.downvotes ?? 0}
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => router.push(`/posts/${post.id}`)}
                >
                  View Discussion
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
