"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoteInfo } from "@/types/types";
import axios from "axios";
import { toast } from "sonner";
import { useCommentVoteInfo } from "@/services/votes/use-comment-vote-info";
import { useUser } from "@/providers/auth-provider";
import { useSigninModal } from "@/hooks/use-signin-modal";

interface CommentVoteButtonProps {
  commentId: number;
  initialState: VoteInfo;
}

export const CommentVoteButton = ({
  commentId,
  initialState,
}: CommentVoteButtonProps) => {
  const { user } = useUser();
  const { open } = useSigninModal();

  const queryClient = useQueryClient();
  const { data } = useCommentVoteInfo(commentId, initialState);

  const { mutate, isPending } = useMutation({
    mutationFn: async () =>
      data.isVotedByUser
        ? axios.delete(`/api/comments/${commentId}/votes`)
        : axios.post(`/api/comments/${commentId}/votes`),
    onMutate: async () => {
      const queryKey = ["comment-vote-info", commentId];
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<VoteInfo>(queryKey);

      queryClient.setQueryData<VoteInfo>(queryKey, {
        votes:
          (previousState?.votes || 0) + (previousState?.isVotedByUser ? -1 : 1),
        isVotedByUser: !previousState?.isVotedByUser,
      });

      return { previousState };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousState) {
        queryClient.setQueryData<VoteInfo>(
          ["comment-vote-info", commentId],
          context.previousState
        );
      }
      toast.error("Failed to update vote status. Please try again.");
    },
  });

  const handleSubmit = () => {
    if (user) {
      mutate();
    } else {
      open();
    }
  };

  return (
    <button
      className={cn(
        "flex items-center gap-1 py-1 rounded-full hover:bg-gray-100 transition-colors",
        data.isVotedByUser && "text-red-500"
      )}
      onClick={handleSubmit}
      disabled={isPending}
    >
      <Heart className={cn("h-4 w-4", data.isVotedByUser && "fill-red-500")} />
      <span className="text-sm font-medium tabular-nums">
        {data.votes} likes
      </span>
    </button>
  );
};
