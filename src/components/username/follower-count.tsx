"use client";

import { useFollowerInfo } from "@/services/followers/use-follower-info";
import { FollowerInfo } from "@/types/types";

interface FollowerCountProps {
  profileId: number;
  initialState: FollowerInfo;
}
export const FollowerCount = ({
  profileId,
  initialState,
}: FollowerCountProps) => {
  const { data } = useFollowerInfo(profileId, initialState);
  return (
    <span>
      Followers <span className="font-semibold">{data.followers}</span>
    </span>
  );
};
