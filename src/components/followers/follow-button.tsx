"use client";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useFollowerInfo } from "@/services/followers/use-follower-info";
import { FollowerInfo } from "@/types/types";
import axios from "axios";
import { toast } from "sonner";

interface FollowButtonProps {
  profileId: number;
  initialState: FollowerInfo;
}

export const FollowButton = ({
  profileId,
  initialState,
}: FollowButtonProps) => {
  const queryClient = useQueryClient();
  const { data } = useFollowerInfo(profileId, initialState);

  const { mutate } = useMutation({
    mutationFn: async () =>
      data.isFollowedByUser
        ? axios.delete(`/api/profiles/${profileId}/followers`)
        : axios.post(`/api/profiles/${profileId}/followers`),
    onMutate: async () => {
      const queryKey: QueryKey = ["follower-info", profileId];

      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);

      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers:
          (previousState?.followers || 0) +
          (previousState?.isFollowedByUser ? -1 : 1),
        isFollowedByUser: !previousState?.isFollowedByUser,
      }));

      return { previousState };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousState) {
        queryClient.setQueryData<FollowerInfo>(
          ["follower-info", profileId],
          context.previousState
        );
      }
      toast.error("Failed to update follow status. Please try again.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follower-info", profileId] });
    },
  });

  return (
    <Button
      variant={data.isFollowedByUser ? "secondary" : "default"}
      onClick={() => mutate()}
    >
      {data.isFollowedByUser ? "Unfollow" : "Follow"}
    </Button>
  );
};
