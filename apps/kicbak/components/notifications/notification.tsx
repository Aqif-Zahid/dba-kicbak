import { cn, formatRelativeDate } from "@/lib/utils";
import { NotificationData } from "@/types/types";
import { NotificationType } from "@prisma/client";
import { Heart, MessageCircle, User2 } from "lucide-react";
import Link from "next/link";
import { JSX } from "react";
import { UserAvatar } from "../common/user-avatar";

interface NotificationProps {
  notification: NotificationData;
}
export const Notification = ({ notification }: NotificationProps) => {
  const notificationTypeMap: Record<
    NotificationType,
    { message: string; icon: JSX.Element; href: string }
  > = {
    FOLLOW: {
      message: `${notification.issuer.displayName} is now following you`,
      icon: <User2 className="size-7 text-primary" />,
      href: `/${notification.issuer.username}`,
    },
    COMMENT: {
      message: `${notification.issuer.displayName} commented on your post`,
      icon: <MessageCircle className="size-7 text-primary fill-primary" />,
      href: `/posts/${notification.postId}`,
    },
    VOTE: {
      message: `${notification.issuer.displayName} liked your post`,
      icon: <Heart className="size-7 text-red-500 fill-red-500 " />,
      href: `/posts/${notification.postId}`,
    },
  };
  const { message, icon, href } = notificationTypeMap[notification.type];
  return (
    <Link href={href} className="block">
      <article
        className={cn(
          "flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70",
          !notification.read && "bg-primary/10"
        )}
      >
        <div className="my-1">{icon}</div>
        <div className="space-y-2">
          <UserAvatar
            avatarUrl={notification.issuer.profilePicture}
            avatarFallback={notification.issuer.username
              .charAt(0)
              .toUpperCase()}
            size={36}
          />
          <div>
            <span className="font-bold">{notification.issuer.displayName}</span>{" "}
            <span>{message}</span>
          </div>
          {notification.post && (
            <div className="line-clamp-3 whitespace-pre-line text-muted-foreground">
              {notification.post.content}
            </div>
          )}

          <p className="block text-sm text-muted-foreground">
            {formatRelativeDate(notification.createdAt)}
          </p>
        </div>
      </article>
    </Link>
  );
};
