"use client";

import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoteInfo } from "@/types/types";
import axios from "axios";
import { toast } from "sonner";
import { useVoteInfo } from "@/services/votes/use-vote-info";
import { useUser } from "@/providers/auth-provider";
import { useSigninModal } from "@/hooks/use-signin-modal";

interface VoteButtonProps {
  postId: number;
  initialState: VoteInfo;
}

export const VoteButton = ({ postId, initialState }: VoteButtonProps) => {
  const { user } = useUser();
  const { open } = useSigninModal();

  const queryClient = useQueryClient();
  const { data } = useVoteInfo(postId, initialState);

  const { mutate } = useMutation({
    mutationFn: async () =>
      data.isVotedByUser
        ? await axios.delete(`/api/posts/${postId}/votes`)
        : await axios.post(`/api/posts/${postId}/votes`),
    onMutate: async () => {
      const queryKey: QueryKey = ["vote-info", postId];

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

  const handleVote = () => {
    if (user) {
      mutate();
    } else {
      open();
    }
  };
  return (
    <button className="flex items-center gap-2" onClick={handleVote}>
      <Heart
        className={cn(
          "size-5",
          data.isVotedByUser && "fill-red-500 text-red-500 "
        )}
      />
      <span className="text-sm font-medium tabular-nums">
        {data.votes} <span className="hidden sm:inline">likes</span>
      </span>
    </button>
  );
};
