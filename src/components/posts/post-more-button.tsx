"use client";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Trash2Icon,
  MessageSquareOff,
  MessageSquare,
  Lock,
} from "lucide-react";
import { Post } from "@/types/types";
import { DeletePostModal } from "./delete-post-modal";
import axios from "axios";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface PostMoreButtonProps {
  post: Post;
  className?: string;
}

export const PostMoreButton = ({ post, className }: PostMoreButtonProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [allowCommentsLocal, setAllowCommentsLocal] = useState<boolean>(post.allowComments);
  const [isClosedLocal, setIsClosedLocal] = useState<boolean | null>(null);

  const queryClient = useQueryClient();

  // Query always returns a defined value (no undefined)
  const { data: pollData } = useQuery({
    queryKey: ["poll", post.id, "menu-status"],
    enabled: post.type === "POLL",
    queryFn: async () => {
      try {
        const res = await fetch(`/api/posts/polls/${post.id}`, { cache: "no-store" });
        const json = await res.json();

        if (json?.status === 0 || !json?.data) {
          return { isClosed: false };
        }
        return json.data;
      } catch {
        return { isClosed: false }; 
      }
    },
    staleTime: 10_000,
  });

  const isPollClosed = post.type !== "POLL"
    ? false
    : (isClosedLocal ?? pollData?.isClosed ?? false);

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const handleToggleComments = async (e: React.MouseEvent) => {
    stop(e);
    setIsToggling(true);

    const postKey = ["post", String(post.id)];
    const feedKey = ["for-you"];
    const commentsKey = ["comments", post.id];

    try {
      setAllowCommentsLocal((v) => !v);

      queryClient.setQueryData(postKey, (old: any) => {
        if (!old?.data) return old;
        return { ...old, data: { ...old.data, allowComments: !old.data.allowComments } };
      });

      queryClient.setQueriesData({ queryKey: feedKey }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: any) =>
              p.id === post.id ? { ...p, allowComments: !p.allowComments } : p
            ),
          })),
        };
      });

      const res = await axios.patch(`/api/posts/${post.id}/toggle-comments`);
      toast.success(res.data?.message || "Comment setting updated");

      queryClient.invalidateQueries({ queryKey: postKey });
      queryClient.invalidateQueries({ queryKey: feedKey });
      queryClient.invalidateQueries({ queryKey: commentsKey });
    } catch {
      toast.error("Failed to toggle comments");
      queryClient.invalidateQueries({ queryKey: ["post", String(post.id)] });
      queryClient.invalidateQueries({ queryKey: ["for-you"] });
      queryClient.invalidateQueries({ queryKey: ["comments", post.id] });
    } finally {
      setIsToggling(false);
    }
  };

  const handleClosePoll = async (e: React.MouseEvent) => {
    stop(e);
    try {
      await axios.patch("/api/posts/polls/close", { postId: post.id });
      setIsClosedLocal(true);

      // Optimistically mark closed in feed and poll cache
      queryClient.setQueriesData({ queryKey: ["for-you"] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: any) =>
              p.id === post.id ? { ...p, poll: { ...(p.poll || {}), isClosed: true } } : p
            ),
          })),
        };
      });

      queryClient.setQueryData(["poll", post.id], (old: any) => {
        if (!old?.data) return old;
        return { ...old, data: { ...old.data, isClosed: true } };
      });

      queryClient.setQueryData(["poll", post.id, "menu-status"], (old: any) =>
        old ? { ...old, isClosed: true } : { isClosed: true }
      );

      toast.success("Poll closed");
      queryClient.invalidateQueries({ queryKey: ["poll", post.id] });
      queryClient.invalidateQueries({ queryKey: ["for-you"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to close poll");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={className}
            data-no-nav
            onClick={stop}
            onMouseDown={stop}
            onPointerDown={stop}
          >
            <MoreHorizontal className="size-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          data-no-nav
          onClick={stop}
          onMouseDown={stop}
          onPointerDown={stop}
        >
          {/* Only show Close Poll if this is a poll and NOT closed */}
          {post.type === "POLL" && !isPollClosed && (
            <DropdownMenuItem onClick={handleClosePoll}>
              <span className="flex items-center gap-3">
                <Lock className="size-4" />
                Close Poll
              </span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleToggleComments} disabled={isToggling}>
            <span className="flex items-center gap-3">
              {allowCommentsLocal ? (
                <>
                  <MessageSquareOff className="size-4" />
                  Disable Comments
                </>
              ) : (
                <>
                  <MessageSquare className="size-4" />
                  Enable Comments
                </>
              )}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              stop(e);
              setShowDeleteDialog(true);
            }}
          >
            <span className="flex items-center gap-3 text-destructive">
              <Trash2Icon className="size-4" />
              Delete
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeletePostModal
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        post={post}
      />
    </>
  );
};
