"use client";
import { useUser } from "@/providers/auth-provider";
import { Post } from "@/types/types";
import Link from "next/link";
import { useState } from "react";
import { UserTooltip } from "../username/user-tooltip";
import { UserAvatar } from "../common/user-avatar";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Linkify } from "../username/linkify";
import { PostMoreButton } from "./post-more-button";
import { MediaPreview } from "./media-preview";
import { CommentButton } from "../comments/comment-button";
import { BookmarkButton } from "../bookmarks/bookmark-button";
import { CommentSection } from "../comments/comment-section";
import { VoteButton } from "@/components/votes/vote-button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PollSection } from "@/components/posts/poll-section";

interface PostDataProps {
  post: Post;
  from?: string;
}

export const PostCard = ({ post, from }: PostDataProps) => {
  const router = useRouter();
  const { user } = useUser();
  const [showComments, setShowComments] = useState(false);

  const handleCommentClick = () => {
    setShowComments((v) => !v);
    if (!post.allowComments) {
      toast.info("Commenting is disabled for this post.");
    }
  };

  // prevent navigation when clicking on interactive elements
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (from) return;

    const target = e.target as HTMLElement;
    const isInteractive = target.closest(
      "button, a, input, textarea, select, [role='menu'], [role='dialog'], [data-no-nav]"
    );
    if (isInteractive) return;

    router.push(`/posts/${post.id}`);
  };

  // Fallbacks for deleted posts
  const isDeleted = post.status === "DELETED";

  // Display logic for answered questions
  const isAnswered = post.type === "QUESTION" && post.hasBestAnswer;
  const displayTitle = isDeleted
    ? "[Deleted]"
    : isAnswered
    ? `${post.title} (Answered)`
    : post.title;

  const displayContent = isDeleted ? "[Deleted]" : post.content;

  return (
    <article className="group/post space-y-3 rounded-2xl bg-card shadow-sm">
      <div
        className={cn(
          "rounded-2xl",
          !from && "hover:bg-gray-100 cursor-pointer"
        )}
        onClick={handleCardClick}
      >
        <div className="flex justify-between gap-3 p-5">
          <div className="flex flex-wrap gap-3">
            <UserTooltip profile={post.authorProfile}>
              <Link href={`/${post.authorProfile.username}`} data-no-nav>
                <UserAvatar
                  avatarUrl={post.authorProfile.profilePicture}
                  avatarFallback={post.authorProfile.username
                    .toUpperCase()
                    .charAt(0)}
                />
              </Link>
            </UserTooltip>
            <div>
              <UserTooltip profile={post.authorProfile}>
                <Link
                  href={`/${post.authorProfile.username}`}
                  className="block font-medium hover:underline"
                  data-no-nav
                >
                  {post.authorProfile.displayName}
                </Link>
              </UserTooltip>
              <Link
                href={`/posts/${post.id}`}
                className="block text-sm text-muted-foreground hover:underline"
                data-no-nav
              >
                {formatRelativeDate(post.createdAt)}
              </Link>
            </div>
          </div>
          {post.authorProfile.id === user?.defaultProfileId && (
            <PostMoreButton
              post={post}
              className="opacity-0 transition-opacity group-hover/post:opacity-100 mx-5"
            />
          )}
        </div>

        {/* Deleted or answered display */}
        <h2
          className={cn(
            "whitespace-pre-line break-words px-5 mb-4 font-bold text-lg text-foreground",
            isDeleted && "italic text-muted-foreground"
          )}
        >
          {displayTitle}
        </h2>

        <Linkify>
          <div
            className={cn(
              "whitespace-pre-line break-words px-5 mb-4",
              isDeleted && "italic text-muted-foreground"
            )}
          >
            {displayContent}
          </div>
        </Linkify>

        {!!post.attachment.length && !isDeleted && (
          <MediaPreview attachment={post.attachment} />
        )}

        {post.type === "POLL" && !isDeleted && (
          <div className="px-5 pb-5">
            <PollSection
              postId={post.id}
              isAuthor={post.authorProfile.id === user?.defaultProfileId}
            />
          </div>
        )}
      </div>

      <hr className="text-muted-foreground" />

      <div className="flex justify-between gap-5 px-5">
        <div className="flex items-center gap-5">
          <VoteButton
            postId={post.id}
            initialState={{
              votes: post._count?.votes ?? 0,
              isVotedByUser:
                post.votes?.some(
                  (vote) => vote.profileId === user?.defaultProfileId
                ) ?? false,
            }}
          />
          <CommentButton post={post} onClick={handleCommentClick} />
        </div>

        <BookmarkButton
          postId={post.id}
          initialState={{
            isBookmarkedByUser:
              post.bookmarks &&
              post.bookmarks.some(
                (bookmark) => bookmark.profileId === Number(user?.id)
              ),
          }}
        />
      </div>

      <div className="px-5 pb-5">
        {showComments && <CommentSection post={post} />}
      </div>
    </article>
  );
};
