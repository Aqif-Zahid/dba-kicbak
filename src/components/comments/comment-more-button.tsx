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
  PinIcon,
  PinOffIcon,
} from "lucide-react";
import { CommentData } from "@/types/types";
import { DeleteCommentModal } from "./delete-comment-modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

interface CommentMoreButtonProps {
  comment: CommentData;
  postId?: number;
  postType?: "DISCUSSION" | "POLL" | "QUESTION";
  isAuthor?: boolean;
  className?: string;
}

export const CommentMoreButton = ({
  comment,
  postId,
  postType,
  isAuthor = false,
  className,
}: CommentMoreButtonProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const pinLabel =
    postType === "QUESTION"
      ? comment.isPinned
        ? "Unmark Best Answer"
        : "Mark as Answer"
      : comment.isPinned
      ? "Unpin Comment"
      : "Pin Comment";

  const { mutate: togglePin, isPending } = useMutation({
    mutationFn: async () => {
      if (!postId) throw new Error("Post ID missing");
      const res = await axios.post(`/api/posts/${postId}/comments/pin`, {
        commentId: comment.id,
        unpin: comment.isPinned,
      });
      return res.data;
    },
    onSuccess: (res) => {
      if (res.status === 1) {
        toast.success(res.message);

        const newHasBest =
          postType === "QUESTION" ? !comment.isPinned : undefined;
        const newAllow =
          postType === "QUESTION" ? comment.isPinned : undefined;

        // ✅ Update cache (both string & number keys)
        for (const keyId of [String(postId), Number(postId)]) {
          queryClient.setQueryData(["post", keyId], (oldData: any) => {
            if (!oldData?.data) return oldData;
            return {
              ...oldData,
              data: {
                ...oldData.data,
                hasBestAnswer:
                  newHasBest === undefined
                    ? oldData.data.hasBestAnswer
                    : newHasBest,
                allowComments:
                  newAllow === undefined
                    ? oldData.data.allowComments
                    : newAllow,
              },
            };
          });
        }

        // ✅ Update feed cards
        queryClient.setQueriesData({ queryKey: ["for-you"] }, (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts: page.posts.map((p: any) =>
                p.id === postId
                  ? {
                      ...p,
                      hasBestAnswer:
                        newHasBest === undefined
                          ? p.hasBestAnswer
                          : newHasBest,
                      allowComments:
                        newAllow === undefined ? p.allowComments : newAllow,
                    }
                  : p
              ),
            })),
          };
        });

        // ✅ Broadcast to PostMoreButton so it hides instantly
        try {
          window.dispatchEvent(
            new CustomEvent("kicbak:bestAnswerToggled", {
              detail: {
                postId,
                hasBestAnswer: newHasBest,
                allowComments: newAllow,
              },
            })
          );
        } catch {
          /* no-op for SSR safety */
        }

        // Invalidate background queries
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        queryClient.invalidateQueries({ queryKey: ["post", postId] });
      } else {
        toast.error(res.message || "Failed to update pin state");
      }
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className={className}>
            <MoreHorizontal className="size-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          {/* Delete Comment */}
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            <span className="flex items-center gap-3 text-destructive">
              <Trash2Icon className="size-4" />
              Delete
            </span>
          </DropdownMenuItem>

          {/* Pin / Unpin Comment (only for post author) */}
          {isAuthor && (
            <DropdownMenuItem
              disabled={isPending}
              onClick={() => togglePin()}
            >
              <span className="flex items-center gap-3">
                {comment.isPinned ? (
                  <PinOffIcon className="size-4 text-muted-foreground" />
                ) : (
                  <PinIcon className="size-4 text-muted-foreground" />
                )}
                {pinLabel}
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteCommentModal
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        comment={comment}
      />
    </>
  );
};
