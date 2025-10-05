"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/providers/auth-provider";

type VoteType = "UPVOTE" | "DOWNVOTE" | null;

export default function PostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<VoteType>(null);

  // Load post, comments, and votes
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const postRes = await axios.get(`/api/posts/${id}`);
        setPost(postRes.data.post);

        const cRes = await axios.get(`/api/comments?postId=${id}`);
        setComments(cRes.data?.comments ?? []);

        // Load vote info
        const vRes = await axios.get(`/api/votes?postId=${id}`);
        const { upvotes, downvotes, userVote: uv } = vRes.data ?? {};
        setPost((prev: any) =>
          prev
            ? { ...prev, upvotes: upvotes ?? prev.upvotes, downvotes: downvotes ?? prev.downvotes }
            : prev
        );
        if (uv === "UPVOTE" || uv === "DOWNVOTE") setUserVote(uv);
      } catch (err) {
        console.error("Load error:", err);
        setError("Failed to load this post.");
      }
    };

    load();
  }, [id, user]);

  // Submit comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      if (!user) {
        setError("You must be signed in to reply.");
        return;
      }
      await axios.post("/api/comments", { postId: id, content: commentText });
      setCommentText("");

      const cRes = await axios.get(`/api/comments?postId=${id}`);
      setComments(cRes.data?.comments ?? []);
    } catch (err) {
      console.error("Comment error:", err);
      setError("Failed to post comment.");
    }
  };

  // Handle voting with live update
  const handleVote = async (voteType: "UPVOTE" | "DOWNVOTE") => {
    try {
      if (!user) {
        setError("You must be logged in to vote.");
        return;
      }

      const res = await axios.post("/api/votes", {
        postId: post.id,
        voteType,
      });

      if (res.data?.success) {
        // ✅ Immediately refresh vote counts from backend
        const vRes = await axios.get(`/api/votes?postId=${id}`);
        const { upvotes, downvotes, userVote: uv } = vRes.data ?? {};
        setPost((prev: any) =>
          prev
            ? { ...prev, upvotes: upvotes ?? prev.upvotes, downvotes: downvotes ?? prev.downvotes }
            : prev
        );
        setUserVote(uv ?? voteType);
      }
    } catch (err) {
      console.error("Vote failed:", err);
      setError("Something went wrong while voting.");
    }
  };

  if (!post) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-600">Loading post...</p>
      </div>
    );
  }

  const upCount = post?.upvotes ?? 0;
  const downCount = post?.downvotes ?? 0;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Button variant="outline" onClick={() => router.push("/posts")}>
        ← Back to Discussions
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {post.title}
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Posted by{" "}
            <strong>{post.authorDisplayName || "Unknown User"}</strong> on{" "}
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
          <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-4">
            {post.content}
          </p>

          {/* Like / Dislike */}
          <div className="flex items-center gap-4">
            <Button
              variant={userVote === "UPVOTE" ? "default" : "outline"}
              size="sm"
              onClick={() => handleVote("UPVOTE")}
              className={
                userVote === "UPVOTE"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : ""
              }
            >
              👍 Like ({upCount})
            </Button>

            <Button
              variant={userVote === "DOWNVOTE" ? "default" : "outline"}
              size="sm"
              onClick={() => handleVote("DOWNVOTE")}
              className={
                userVote === "DOWNVOTE"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : ""
              }
            >
              👎 Dislike ({downCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      <section>
        <h3 className="text-lg font-semibold mt-8 mb-4 text-gray-800">
          Discussion ({comments?.length ?? 0})
        </h3>

        {(comments?.length ?? 0) === 0 ? (
          <p className="text-gray-500 italic">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <Card key={c.id}>
                <CardContent className="pt-4">
                  <p className="text-gray-700">{c.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    — <strong>{c.authorDisplayName || "User"}</strong> on{" "}
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Unknown Date"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add comment */}
        {user ? (
          <form onSubmit={handleCommentSubmit} className="mt-6 space-y-3">
            <Textarea
              placeholder="Write a reply..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button type="submit" size="sm">
              Post Reply
            </Button>
          </form>
        ) : (
          <p className="text-sm text-gray-600 mt-4">
            Sign in to participate in the discussion.
          </p>
        )}
      </section>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
