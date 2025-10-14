"use client";

import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoteInfo } from "@/types/types";
import axios from "axios";
import { toast } from "sonner";
import { useVoteInfo } from "@/services/votes/use-vote-info";

interface VoteButtonProps {
  postId: number;
  initialState: VoteInfo;
}

export const VoteButton = ({ postId, initialState }: VoteButtonProps) => {
  const queryClient = useQueryClient();
  const { data } = useVoteInfo(postId, initialState);

  const { mutate } = useMutation({
    mutationFn: async () =>
      data.isVotedByUser
        ? await axios.delete(`/api/posts/${postId}/votes`)
        : await axios.post(`/api/posts/${postId}/votes`),
    onMutate: async () => {
      const queryKey: QueryKey = ["votes-info", postId];

      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<VoteInfo>(queryKey);

      queryClient.setQueryData<VoteInfo>(queryKey, () => ({
        votes:
          (previousState?.votes || 0) + (previousState?.isVotedByUser ? -1 : 1),
        isVotedByUser: !previousState?.isVotedByUser,
      }));

      return { previousState };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousState) {
        queryClient.setQueryData<VoteInfo>(
          ["vote-info", postId],
          context.previousState
        );
      }
      toast.error("Failed to update vote status. Please try again.");
    },
    // onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: ["vote-info", postId] });
    // },
  });

  return (
    <button className="flex items-center gap-2" onClick={() => mutate()}>
      <Heart
        className={cn(
          "size-5",
          data.isVotedByUser && "fill-red-500 text-red-500 "
        )}
      />
      <span className="text-sm font-medium tabular-nums">
        {data.votes} <span className="hidden sm:inline">votes</span>
      </span>
    </button>
  );
};
