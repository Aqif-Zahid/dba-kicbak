"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  authorDisplayName: string | null;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await axios.get("/api/posts");
        setPosts(res.data.posts || []);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="animate-spin w-6 h-6 text-gray-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Community Discussions
        </h1>
        <Link href="/">
          <Button variant="outline">← Back to Home</Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500 text-center">No posts yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="p-4 hover:shadow-md transition-shadow bg-white"
            >
              <h2 className="text-lg font-semibold mb-1 text-gray-800">
                {post.title}
              </h2>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {post.content}
              </p>
              <div className="text-xs text-gray-400 mb-3">
                Posted by{" "}
                <span className="font-medium text-gray-500">
                  {post.authorDisplayName || "Unknown"}
                </span>{" "}
                on{" "}
                {new Date(post.createdAt).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <Link href={`/posts/${post.id}`}>
                <Button size="sm" className="mt-1">
                  View Discussion
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
