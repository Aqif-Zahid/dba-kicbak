"use client";

import { useFollowerInfo } from "@/services/followers/use-follower-info";
import { FollowerInfo } from "@/types/types";

interface FollowerCountProps {
  userId: number;
  initialState: FollowerInfo;
}
export const FollowerCount = ({ userId, initialState }: FollowerCountProps) => {
  const { data } = useFollowerInfo(userId, initialState);
  return (
    <span>
      Followers <span className="font-semibold">{data.followers}</span>
    </span>
  );
};
