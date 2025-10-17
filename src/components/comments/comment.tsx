import Link from "next/link";
import { formatRelativeDate } from "@/lib/utils";
import { useUser } from "@/providers/auth-provider";
import { CommentData } from "@/types/types";
import { UserAvatar } from "../common/user-avatar";
import { UserTooltip } from "../username/user-tooltip";
import { CommentMoreButton } from "./comment-more-button";
import { CommentVoteButton } from "../votes/comment-vote-button";

interface CommentProps {
  comment: CommentData;
}

export const Comment = ({ comment }: CommentProps) => {
  const { user } = useUser();
  const isAuthor = comment.authorProfileId === user?.defaultProfileId;

  return (
    <div className="flex flex-col gap-2 border-b border-gray-200 py-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <UserTooltip profile={comment.authorProfile}>
          <Link href={`/${comment.authorProfile.username}`}>
            <UserAvatar
              avatarUrl={comment.authorProfile.profilePicture}
              size={40}
              avatarFallback={comment.authorProfile.username
                .charAt(0)
                .toUpperCase()}
            />
          </Link>
        </UserTooltip>

        {/* Comment body */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <UserTooltip profile={comment.authorProfile}>
              <Link
                href={`/${comment.authorProfile.username}`}
                className="font-medium hover:underline"
              >
                {comment.authorProfile.displayName}
              </Link>
            </UserTooltip>
            <span className="text-muted-foreground text-xs">
              {formatRelativeDate(comment.createdAt || new Date())}
            </span>
          </div>

          <p className="mt-1 text-gray-800">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center">
            <CommentVoteButton
              commentId={comment.id}
              initialState={{
                votes: comment._count.commentVotes,
                isVotedByUser: comment.commentVotes.some(
                  (vote) => vote.profileId === user?.defaultProfileId
                ),
              }}
            />

            {isAuthor && (
              <CommentMoreButton comment={comment} className="ml-auto" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
