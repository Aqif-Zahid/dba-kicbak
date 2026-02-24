import Image from "next/image";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
  avatarFallback: string;
}

export const UserAvatar = ({
  avatarUrl,
  size,
  className,
  avatarFallback,
}: UserAvatarProps) => {
  return (
    <>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="User avatar"
          width={size ?? 48}
          height={size ?? 48}
          className={cn(
            "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
            className
          )}
        />
      ) : (
        <Avatar className="w-10 h-10 border border-neutral-300 hover:opacity-80 transition">
          <AvatarFallback className="bg-neutral-200 text-neutral-500 font-medium flex items-center justify-center">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      )}
    </>
  );
};
