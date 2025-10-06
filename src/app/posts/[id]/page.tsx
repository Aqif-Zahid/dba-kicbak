"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/providers/auth-provider";
import { useSigninModal } from "@/hooks/use-signin-modal";
import { Layout } from "@/components/layout/layout";

type VoteType = "UPVOTE" | "DOWNVOTE" | null;

interface Comment {
  id: number;
  content: string;
  authorDisplayName?: string;
  createdAt: string;
  replies?: Comment[];
  parentId?: number | null;
  upvotes?: number;
  downvotes?: number;
  userVote?: VoteType;
}

export default function PostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { open: openSigninModal } = useSigninModal();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<VoteType>(null);

  // Load post + comments + votes
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const postRes = await axios.get(`/api/posts/${id}`);
        setPost(postRes.data.post);

        const cRes = await axios.get(`/api/comments?postId=${id}`);
        setComments(cRes.data?.comments ?? []);

        // Load vote data
        try {
          const vRes = await axios.get(`/api/votes?postId=${id}`);
          const { userVote: uv, upvotes, downvotes } = vRes.data ?? {};
          if (uv === "UPVOTE" || uv === "DOWNVOTE") setUserVote(uv);
          if (typeof upvotes === "number" || typeof downvotes === "number") {
            setPost((prev: any) =>
              prev ? { ...prev, upvotes, downvotes } : prev
            );
          }
        } catch (voteErr: any) {
          if (voteErr?.response?.status !== 405)
            console.warn("Vote fetch warning:", voteErr?.message || voteErr);
        }
      } catch (err) {
        console.error("Load error:", err);
        setError("Failed to load this post.");
      }
    };

    load();
  }, [id]);

  // Helper: require login
  const requireLogin = (action: () => void) => {
    if (!user) {
      openSigninModal();
      return false;
    }
    action();
    return true;
  };

  // Submit new top-level comment
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    requireLogin(async () => {
      try {
        await axios.post("/api/comments", { postId: id, content: commentText });
        setCommentText("");
        const cRes = await axios.get(`/api/comments?postId=${id}`);
        setComments(cRes.data?.comments ?? []);
      } catch (err) {
        console.error("Comment error:", err);
        setError("Failed to post comment.");
      }
    });
  };

  // Submit reply to a comment
  const handleReplySubmit = (parentId: number) => {
    if (!replyText.trim()) return;

    requireLogin(async () => {
      try {
        await axios.post("/api/comments", {
          postId: id,
          content: replyText,
          parentId,
        });
        setReplyText("");
        setReplyingTo(null);

        const cRes = await axios.get(`/api/comments?postId=${id}`);
        setComments(cRes.data?.comments ?? []);
      } catch (err) {
        console.error("Reply error:", err);
        setError("Failed to post reply.");
      }
    });
  };

  // Post voting
  const handleVote = (voteType: "UPVOTE" | "DOWNVOTE") => {
    requireLogin(async () => {
      try {
        const res = await axios.post("/api/votes", {
          postId: post.id,
          voteType,
        });

        if (res.data?.success) {
          const { upvotes, downvotes } = res.data;
          setPost((prev: any) =>
            prev ? { ...prev, upvotes, downvotes } : prev
          );
          setUserVote((prev) => (prev === voteType ? null : voteType));
        }
      } catch (err) {
        console.error("Vote failed:", err);
        setError("Something went wrong while voting.");
      }
    });
  };

  // Comment voting
  const handleCommentVote = (
    commentId: number,
    voteType: "UPVOTE" | "DOWNVOTE"
  ) => {
    requireLogin(async () => {
      try {
        const res = await axios.post("/api/votes", { commentId, voteType });

        if (res.data?.success) {
          const { upvotes, downvotes } = res.data;

          // Recursive update
          const updateVotes = (items: Comment[]): Comment[] =>
            items.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    upvotes,
                    downvotes,
                    userVote: c.userVote === voteType ? null : voteType,
                  }
                : c.replies
                ? { ...c, replies: updateVotes(c.replies) }
                : c
            );

          setComments((prev) => updateVotes(prev));
        }
      } catch (err) {
        console.error("Comment vote error:", err);
        setError("Something went wrong while voting on a comment.");
      }
    });
  };

  const upCount = post?.upvotes ?? 0;
  const downCount = post?.downvotes ?? 0;

  // Recursive rendering
  const renderComments = (comments: Comment[], depth = 0) => (
    <div className={`space-y-4 ${depth > 0 ? "pl-6 border-l" : ""}`}>
      {comments.map((c) => (
        <Card key={c.id} className="bg-gray-50 border border-gray-200">
          <CardContent className="pt-4">
            <p className="text-gray-800">{c.content}</p>
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

            {/* Comment Actions */}
            <div className="mt-2 flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setReplyingTo(replyingTo === c.id ? null : c.id)
                }
              >
                💬 Reply
              </Button>

              <Button
                variant={c.userVote === "UPVOTE" ? "default" : "outline"}
                size="sm"
                onClick={() => handleCommentVote(c.id, "UPVOTE")}
                className={
                  c.userVote === "UPVOTE"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "text-green-600 hover:bg-green-100"
                }
              >
                👍 {c.upvotes ?? 0}
              </Button>

              <Button
                variant={c.userVote === "DOWNVOTE" ? "default" : "outline"}
                size="sm"
                onClick={() => handleCommentVote(c.id, "DOWNVOTE")}
                className={
                  c.userVote === "DOWNVOTE"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "text-red-600 hover:bg-red-100"
                }
              >
                👎 {c.downvotes ?? 0}
              </Button>
            </div>

            {/* Reply Form */}
            {replyingTo === c.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReplySubmit(c.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Submit Reply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Nested Replies */}
            {c.replies && c.replies.length > 0 && (
              <div className="mt-4">{renderComments(c.replies, depth + 1)}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (!post) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-gray-600">Loading post...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Button
          variant="outline"
          onClick={() => router.push("/posts")}
          className="mb-4"
        >
          ← Back to Discussions
        </Button>

        {/* Post Content */}
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

            {/* Post Like / Dislike */}
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
                👍 Like ({post?.upvotes ?? 0})
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
                👎 Dislike ({post?.downvotes ?? 0})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        <section>
          <h3 className="text-lg font-semibold mt-8 mb-4 text-gray-800">
            Discussion ({comments?.length ?? 0})
          </h3>

          {comments.length === 0 ? (
            <p className="text-gray-500 italic">
              No comments yet. Be the first!
            </p>
          ) : (
            renderComments(comments)
          )}

          {/* Add New Comment */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mt-6 space-y-3">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button type="submit" size="sm">
                Post Comment
              </Button>
            </form>
          ) : (
            <Button onClick={openSigninModal} className="mt-4 bg-pink-600 text-white">
              Sign in to Comment
            </Button>
          )}
        </section>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>
    </Layout>
  );
}
