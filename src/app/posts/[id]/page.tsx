"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/providers/auth-provider";
import { useSigninModal } from "@/hooks/use-signin-modal";
import { Sidebar } from "@/components/home/side-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useState } from "react";
import { toast } from "sonner";

export default function PostPage() {
  const params = useParams();
  const postId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const router = useRouter();
  const { user } = useUser();
  const { open: openSigninModal } = useSigninModal();
  const queryClient = useQueryClient();

  // --- Query ---
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const res = await axios.get(`/api/posts/${postId}`);
      return res.data.post;
    },
    enabled: !!postId,
  });

  // --- Local state ---
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // --- Mutations ---

  // ✅ Optimistic post vote mutation
  const voteMutation = useMutation({
    mutationFn: async (voteType: "UPVOTE" | "DOWNVOTE") => {
      await axios.post("/api/votes", { postId, voteType });
      return voteType;
    },
    onMutate: async (voteType) => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      const prev = queryClient.getQueryData<any>(["post", postId]);
      if (!prev) return;

      const newVote = prev.userVote === voteType ? null : voteType;
      const deltaUp =
        newVote === "UPVOTE" ? 1 : prev.userVote === "UPVOTE" ? -1 : 0;
      const deltaDown =
        newVote === "DOWNVOTE" ? 1 : prev.userVote === "DOWNVOTE" ? -1 : 0;

      queryClient.setQueryData(["post", postId], {
        ...prev,
        upvotes: prev.upvotes + deltaUp,
        downvotes: prev.downvotes + deltaDown,
        userVote: newVote,
      });

      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(["post", postId], context.prev);
      toast.error("Vote failed");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["post", postId] }),
  });

  // ✅ Optimistic comment vote mutation
  const commentVoteMutation = useMutation({
    mutationFn: async ({
      commentId,
      voteType,
    }: {
      commentId: number;
      voteType: "UPVOTE" | "DOWNVOTE";
    }) => {
      await axios.post("/api/votes", { commentId, voteType });
      return { commentId, voteType };
    },
    onMutate: async ({ commentId, voteType }) => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      const prev = queryClient.getQueryData<any>(["post", postId]);
      if (!prev) return;

      const updateTree = (arr: any[]): any[] =>
        arr.map((c) => {
          if (c.id === commentId) {
            const newVote = c.userVote === voteType ? null : voteType;
            const deltaUp =
              newVote === "UPVOTE" ? 1 : c.userVote === "UPVOTE" ? -1 : 0;
            const deltaDown =
              newVote === "DOWNVOTE" ? 1 : c.userVote === "DOWNVOTE" ? -1 : 0;
            return {
              ...c,
              upvotes: c.upvotes + deltaUp,
              downvotes: c.downvotes + deltaDown,
              userVote: newVote,
            };
          }
          return { ...c, replies: updateTree(c.replies ?? []) };
        });

      const updated = { ...prev, comments: updateTree(prev.comments) };
      queryClient.setQueryData(["post", postId], updated);

      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(["post", postId], context.prev);
      toast.error("Vote failed");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["post", postId] }),
  });

  const deletePostMutation = useMutation({
    mutationFn: async () => axios.patch(`/api/posts/${postId}`, { status: "DELETED" }),
    onSuccess: () => {
      toast.success("Post deleted");
      router.push("/posts");
    },
  });

  const editPostMutation = useMutation({
    mutationFn: async () =>
      axios.patch(`/api/posts/${postId}`, { title: editTitle, content: editContent }),
    onSuccess: () => {
      setIsEditing(false);
      toast.success("Post updated");
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (body: any) => axios.post("/api/comments", body),
    onSuccess: () => {
      setNewComment("");
      setReplyingTo(null);
      setReplyContent("");
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) =>
      axios.patch(`/api/comments`, { commentId, status: "DELETED" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post", postId] }),
  });

  const editCommentMutation = useMutation({
    mutationFn: async (commentId: number) =>
      axios.patch(`/api/comments`, {
        commentId,
        content: editCommentContent,
        status: "EDITED",
      }),
    onSuccess: () => {
      setEditingComment(null);
      setEditCommentContent("");
      toast.success("Comment updated");
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  // --- Handlers ---
  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading post...
      </div>
    );
  if (isError || !post)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Failed to load post.
      </div>
    );

  const isAdmin = (user?.role ?? "").toUpperCase() === "ADMIN";
  const isAuthor = user && Number(user.id) === Number(post.authorProfileId);
  const canEditPost = isAuthor;
  const canDeletePost = isAuthor || isAdmin;

  const handleVote = (voteType: "UPVOTE" | "DOWNVOTE") => {
    if (!user) return openSigninModal();
    voteMutation.mutate(voteType);
  };

  const handleCommentVote = (commentId: number, voteType: "UPVOTE" | "DOWNVOTE") => {
    if (!user) return openSigninModal();
    commentVoteMutation.mutate({ commentId, voteType });
  };

  const handleDeletePost = () => {
    if (!user) return openSigninModal();
    if (!canDeletePost) return alert("You don't have permission.");
    if (confirm("Delete this post?")) deletePostMutation.mutate();
  };

  const handleSaveEdit = () => editPostMutation.mutate();
  const handleCommentSubmit = () => {
    if (!user) return openSigninModal();
    if (!newComment.trim()) return;
    commentMutation.mutate({ postId: post.id, content: newComment });
  };
  const handleReplySubmit = (parentId: number) => {
    if (!user) return openSigninModal();
    if (!replyContent.trim()) return;
    commentMutation.mutate({ postId: post.id, content: replyContent, parentId });
  };
  const handleCommentDelete = (id: number) => {
    if (!user) return openSigninModal();
    if (confirm("Delete this comment?")) deleteCommentMutation.mutate(id);
  };
  const handleCommentEdit = (id: number) => {
    if (!user) return openSigninModal();
    editCommentMutation.mutate(id);
  };

  // --- Recursive Comments ---
  const renderComments = (comments: any[], depth = 0) => (
    <div className={`${depth > 0 ? "pl-4 border-l border-gray-200" : ""}`}>
      {comments.map((c) => {
        const isCommentAuthor = user && Number(user.id) === Number(c.authorUserId);
        const canEdit = isCommentAuthor;
        const canDelete = isCommentAuthor || isAdmin;
        const isEditingThis = editingComment === c.id;
        const isReplying = replyingTo === c.id;
        const isDeleted = c.isDeleted; // ✅ fixed check

        return (
          <Card key={c.id} className="mt-3 border border-gray-200 bg-gray-50 rounded-lg">
            <CardContent className="pt-4">
              {!isEditingThis ? (
                <>
                  <p className="text-gray-800">{isDeleted ? "[deleted]" : c.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    — {isDeleted ? "[deleted user]" : c.authorDisplayName} on{" "}
                    {new Date(c.createdAt).toLocaleDateString("en-US")}
                  </p>
                </>
              ) : (
                <div className="space-y-2">
                  <Textarea
                    value={editCommentContent}
                    onChange={(e) => setEditCommentContent(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleCommentEdit(c.id)}
                      className="bg-pink-600 text-white"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingComment(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {!isDeleted && (
                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCommentVote(c.id, "UPVOTE")}
                    className={`${
                      c.userVote === "UPVOTE"
                        ? "bg-green-600 text-white ring-2 ring-green-400 ring-offset-1"
                        : "text-green-600 hover:bg-green-100"
                    } transition-all`}
                  >
                    👍 {c.upvotes ?? 0}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCommentVote(c.id, "DOWNVOTE")}
                    className={`${
                      c.userVote === "DOWNVOTE"
                        ? "bg-red-600 text-white ring-2 ring-red-400 ring-offset-1"
                        : "text-red-600 hover:bg-red-100"
                    } transition-all`}
                  >
                    👎 {c.downvotes ?? 0}
                  </Button>

                  {canEdit && !isEditingThis && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingComment(c.id);
                        setEditCommentContent(c.content);
                      }}
                    >
                      ✏️ Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCommentDelete(c.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      🗑 Delete
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                  >
                    💬 Reply
                  </Button>
                </div>
              )}

              {isReplying && !isDeleted && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-pink-600 text-white"
                      onClick={() => handleReplySubmit(c.id)}
                    >
                      Post Reply
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {c.replies?.length > 0 && renderComments(c.replies, depth + 1)}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header />
      <div className="flex flex-1 container mx-auto px-4 py-6 gap-6">
        <div className="hidden lg:block w-[260px] flex-shrink-0 border border-gray-200 rounded-xl bg-white shadow-sm">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col">
          <Button variant="outline" onClick={() => router.back()} className="mb-2">
            ← Back
          </Button>

          <Card className="border border-gray-200 bg-white shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {post.status === "DELETED" ? "[deleted]" : post.title}
              </CardTitle>
              <p className="text-sm text-gray-500">
                Posted by{" "}
                <strong className="text-gray-700">
                  {post.status === "DELETED"
                    ? "[deleted user]"
                    : post.authorDisplayName}
                </strong>{" "}
                • {new Date(post.createdAt).toLocaleDateString("en-US")}
              </p>
            </CardHeader>

            <CardContent>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line mb-4">
                {post.status === "DELETED" ? "[deleted]" : post.content}
              </p>

              {post.status !== "DELETED" && (
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Button
                    onClick={() => handleVote("UPVOTE")}
                    variant="outline"
                    className={`${
                      post.userVote === "UPVOTE"
                        ? "bg-green-600 text-white ring-2 ring-green-400 ring-offset-1"
                        : "hover:bg-green-50"
                    } transition-all`}
                  >
                    👍 Like ({post.upvotes})
                  </Button>

                  <Button
                    onClick={() => handleVote("DOWNVOTE")}
                    variant="outline"
                    className={`${
                      post.userVote === "DOWNVOTE"
                        ? "bg-red-600 text-white ring-2 ring-red-400 ring-offset-1"
                        : "hover:bg-red-50"
                    } transition-all`}
                  >
                    👎 Dislike ({post.downvotes})
                  </Button>

                  {canEditPost && !isEditing && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditTitle(post.title);
                        setEditContent(post.content);
                        setIsEditing(true);
                      }}
                    >
                      ✏️ Edit
                    </Button>
                  )}

                  {canDeletePost && (
                    <Button
                      variant="ghost"
                      onClick={handleDeletePost}
                      className="text-red-600 hover:bg-red-50"
                    >
                      🗑 Delete
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <section>
            <h3 className="text-lg font-semibold mt-6 text-gray-800">
              Comments ({post.comments.length})
            </h3>
            {post.comments.length === 0 ? (
              <p className="text-gray-500 mt-2">No comments yet.</p>
            ) : (
              renderComments(post.comments)
            )}
            {user && post.status !== "DELETED" ? (
              <div className="mt-6 space-y-3">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  className="bg-pink-600 hover:bg-pink-700 text-white"
                  onClick={handleCommentSubmit}
                >
                  Post Comment
                </Button>
              </div>
            ) : (
              <Button
                onClick={openSigninModal}
                className="mt-4 bg-pink-600 text-white hover:bg-pink-700"
              >
                Sign in to Comment
              </Button>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
