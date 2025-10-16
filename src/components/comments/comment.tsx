import { formatRelativeDate } from "@/lib/utils";
import Link from "next/link";
import { useUser } from "@/providers/auth-provider";
import { CommentData } from "@/types/types";
import { UserTooltip } from "../username/user-tooltip";
import { UserAvatar } from "../common/user-avatar";
import { CommentMoreButton } from "./comment-more-button";

interface CommentProps {
  comment: CommentData;
}

export const Comment = ({ comment }: CommentProps) => {
  const { user } = useUser();

  return (
    <div className="flex gap-3 py-3 group/comment">
      <span className="hidden sm:inline">
        <UserTooltip profile={comment.authorProfile}>
          <Link href={`/users/${comment.authorProfile.username}`}>
            <UserAvatar
              avatarUrl={comment.authorProfile.profilePicture}
              size={40}
              avatarFallback={comment.authorProfile.username.charAt(0)}
            />
          </Link>
        </UserTooltip>
      </span>
      <div>
        <div className="flex items-center text-sm gap-1">
          <UserTooltip profile={comment.authorProfile}>
            <Link
              href={`/users/${comment.authorProfile.username}`}
              className="font-medium hover:underline"
            >
              {comment.authorProfile.displayName}
            </Link>
          </UserTooltip>
          <span className="text-muted-foreground text-xs">
            {formatRelativeDate(comment.createdAt || new Date())}
          </span>
        </div>
        <div>{comment.content}</div>
      </div>
      {comment.authorProfileId === user?.defaultProfileId && (
        <CommentMoreButton
          comment={comment}
          className="ms-auto opacity-0 transition-opacity group-hover/comment:opacity-100"
        />
      )}
    </div>
  );
};
