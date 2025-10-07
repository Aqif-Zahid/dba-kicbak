"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/auth-provider";
import { useSigninModal } from "@/hooks/use-signin-modal";
import { Sidebar } from "@/components/home/side-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CreatePostModal } from "@/components/modals/create-post-modal";

export default function PostsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { open: openSigninModal } = useSigninModal();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await axios.get("/api/posts");
      return res.data.posts;
    },
  });

  const posts = data || [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header />

      <div className="flex flex-1 container mx-auto px-4 py-6 gap-6">
        <div className="hidden lg:block w-[260px] flex-shrink-0 border border-gray-200 rounded-xl bg-white shadow-sm">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Community Discussions</h1>

            {user ? (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-pink-600 hover:bg-pink-700 text-white font-semibold"
              >
                + Create Post
              </Button>
            ) : (
              <Button
                onClick={openSigninModal}
                className="bg-pink-600 hover:bg-pink-700 text-white font-semibold"
              >
                Sign In to Post
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading discussions...</div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">Failed to load posts.</div>
          ) : posts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No posts yet. Be the first to share something!
            </p>
          ) : (
            <div className="space-y-4">
              {posts.map((post: any) => {
                const isDeleted = post.status === "DELETED";
                return (
                  <Card
                    key={post.id}
                    className={`border border-gray-200 bg-white transition-shadow rounded-xl ${
                      isDeleted
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:shadow-md cursor-pointer"
                    }`}
                    onClick={() => {
                      if (!isDeleted) router.push(`/posts/${post.id}`); // ✅ prevent click if deleted
                    }}
                  >
                    <CardHeader>
                      <CardTitle
                        className={`text-lg font-semibold ${
                          isDeleted ? "text-gray-500 italic" : "text-gray-900"
                        }`}
                      >
                        {isDeleted ? "[deleted]" : post.title}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        Posted by{" "}
                        <strong className="text-gray-700">
                          {isDeleted
                            ? "[deleted user]"
                            : post.authorDisplayName || "User"}
                        </strong>{" "}
                        • {new Date(post.createdAt).toLocaleDateString("en-US")}
                      </p>
                    </CardHeader>

                    <CardContent>
                      <p
                        className={`line-clamp-3 mb-3 ${
                          isDeleted ? "text-gray-500 italic" : "text-gray-700"
                        }`}
                      >
                        {isDeleted ? "[deleted]" : post.content}
                      </p>

                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <p>
                          💬 {post.commentCount}{" "}
                          {post.commentCount === 1 ? "comment" : "comments"}
                        </p>
                        <p>⬆️ {post.upvotes - post.downvotes} points</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
