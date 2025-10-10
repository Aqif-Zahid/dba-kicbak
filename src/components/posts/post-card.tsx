"use client";
import { useUser } from "@/providers/auth-provider";
import { Post } from "@/types/types";
import Link from "next/link";
import { useState } from "react";
import { UserTooltip } from "../username/user-tooltip";
import { UserAvatar } from "../common/user-avatar";
import { formatRelativeDate } from "@/lib/utils";
import { Linkify } from "../username/linkify";
import { PostMoreButton } from "./post-more-button";

interface PostDataProps {
  post: Post;
}

export const PostCard = ({ post }: PostDataProps) => {
  const { user } = useUser();

  const [showComments, setShowComments] = useState(false);

  return (
    <article className="group/post space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.authorProfile.username}`}>
              <UserAvatar
                avatarUrl={post.authorProfile.profilePicture}
                avatarFallback="A"
              />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={post.authorProfile}>
              <Link
                href={`/users/${post.authorProfile.username}`}
                className="block font-medium hover:underline"
              >
                {post.authorProfile.displayName}
              </Link>
            </UserTooltip>
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>
        {post.authorProfile.id === Number(user?.id) && (
          <PostMoreButton
            post={post}
            className="opacity-0 transition-opacity group-hover/post:opacity-100"
          />
        )}
      </div>
      <Linkify>
        <div className="whitespace-pre-line break-words">{post.content}</div>
      </Linkify>
      {!!post.attachment.length && (
        <MediaPreview attachment={post.attachment} />
      )}
      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: post.likes.some((like) => like.userId === user.id),
            }}
          />
          <CommentButton
            post={post}
            onClick={() => setShowComments(!showComments)}
          />
        </div>
        <BookmarkButton
          postId={post.id}
          initialState={{
            isBookmarkedByUser: post.bookmarks.some(
              (bookmark) => bookmark.userId === user.id
            ),
          }}
        />
      </div>
      {showComments && <CommentSection post={post} />}
    </article>
  );
};
