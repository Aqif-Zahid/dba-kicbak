"use client";

import Link from "next/link";
import { formatRelativeDate } from "@/lib/utils";
import { useUser } from "@/providers/auth-provider";
import { CommentData } from "@/types/types";
import { UserAvatar } from "../common/user-avatar";
import { UserTooltip } from "../username/user-tooltip";
import { CommentMoreButton } from "./comment-more-button";
import { CommentVoteButton } from "../votes/comment-vote-button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEditComment } from "@/services/comments/use-edit-comment";
import { toast } from "sonner";

interface CommentProps {
  comment: CommentData;
}

export const Comment = ({ comment }: CommentProps) => {
  const { user } = useUser();
  const currentProfileId = user?.defaultProfileId;
  const isCommentAuthor = comment.authorProfileId === currentProfileId;

  const author = (comment as any).authorProfile ?? {
    id: comment.authorProfileId,
    username: (comment as any).authorUsername ?? null,
    displayName: (comment as any).authorDisplayName ?? "User",
    profilePicture: null,
  };
  const isPostAuthor = comment.posts?.authorProfileId === currentProfileId;

  // New local states for inline editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content || "");
  const { mutate: editComment, isPending } = useEditComment();

  const handleSave = () => {
    if (!editedContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    editComment(
      {
        commentId: comment.id,
        postId: comment.postId,
        content: editedContent.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Comment updated successfully");
          setIsEditing(false);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-2 border-b border-gray-200 py-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <UserTooltip profile={author}>
          <Link href={author?.username ? `/` : "#"}>
            <UserAvatar
              avatarUrl={author.profilePicture}
              size={40}
              avatarFallback={(author?.username ?? author?.displayName ?? "U").charAt(0).toUpperCase()}
            />
          </Link>
        </UserTooltip>

        {/* Comment body */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <UserTooltip profile={author}>
              <Link
                href={author?.username ? `/` : "#"}
                className="font-medium hover:underline"
              >
                {author.displayName}
              </Link>
            </UserTooltip>
            <span className="text-muted-foreground text-xs">
              {formatRelativeDate(comment.createdAt || new Date())}
            </span>
            {comment.edited && (
              <span className="text-xs text-muted-foreground ml-1">
                (edited)
              </span>
            )}
          </div>

          {/* Inline edit mode */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                disabled={isPending}
                className="min-h-[80px]"
              />
              <div className="flex justify-end gap-2">
                <Button onClick={handleSave} disabled={isPending}>
                  {isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditedContent(comment.content || "");
                    setIsEditing(false);
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            // Normal comment text display
            <p
              className={`mt-1 text-sm ${
                comment.status === "DELETED"
                  ? "italic text-muted-foreground"
                  : "text-gray-800"
              }`}
            >
              {comment.status === "DELETED" ? "[Deleted]" : comment.content}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center">
            <CommentVoteButton
              commentId={comment.id}
              initialState={{
                votes: (comment as any)?._count?.commentVotes ?? (comment as any)?.upvotes ?? 0,
                isVotedByUser: Boolean((comment as any)?.commentVotes?.some((vote: any) => vote?.profileId === currentProfileId) ?? ((comment as any)?.userVote ? true : false)),
              }}
            />

            {/* Show menu if comment owner or post owner */}
            {(isCommentAuthor || isPostAuthor) && (
              <CommentMoreButton
                comment={comment}
                postId={comment.postId}
                postType={comment.posts?.type}
                isAuthor={isPostAuthor}
                className="ml-auto"
                onEdit={() => setIsEditing(true)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
