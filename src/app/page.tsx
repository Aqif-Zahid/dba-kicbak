"use client";

import { useSession } from "next-auth/react";
import { TravelBenefits } from "@/components/home/traveler-benefits";
import { HeroSection } from "@/components/home/hero-section";
import { Layout } from "@/components/layout/layout";
import { Sidebar } from "@/components/home/side-bar";
import { ProfileCompletionModal } from "@/components/modals/profile-completion-modal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const userStatus = (session?.user as any)?.status as
    | "WAITLISTED"
    | "PENDING"
    | "ACTIVE"
    | "BLOCKED"
    | undefined;
  const isSignedIn = authStatus === "authenticated";
  const isLoading = authStatus === "loading";

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

  // 1️⃣ Loading spinner while NextAuth initializes
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // 2️⃣ Pending users must complete profile
  if (isSignedIn && userStatus === "PENDING") {
    return <ProfileCompletionModal isOpen={true} onClose={() => {}} />;
  }

  // 3️⃣ Main home page view — now always shows Sidebar
  return (
    <Layout>
      <div className="flex w-full min-h-[calc(100vh-64px)]">
        {/* Sidebar always visible */}
        <div className="hidden lg:block w-[280px] border-r border-gray-200 sticky top-0 h-full">
          <Sidebar />
        </div>

        {/* Main content area */}
        <div className="flex-1 p-6">
          {/* Signed-in active users */}
          {isSignedIn && userStatus === "ACTIVE" ? (
            <>
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
                        <p className="text-gray-700 line-clamp-2">
                          {post.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Unsigned user view
            <div className="w-full">
              <HeroSection />
              <TravelBenefits />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
