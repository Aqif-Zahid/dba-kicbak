"use client";

import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { LikeInfo } from "@/types/types";
import { useLikeInfo } from "@/services/likes/use-like-info";
import axios from "axios";
import { toast } from "sonner";

interface LikeButtonProps {
  postId: number;
  initialState: LikeInfo;
}

export const LikeButton = ({ postId, initialState }: LikeButtonProps) => {
  const queryClient = useQueryClient();
  const { data } = useLikeInfo(postId, initialState);

  const { mutate } = useMutation({
    mutationFn: async () =>
      data.isLikedByUser
        ? await axios.delete(`/api/posts/${postId}/likes`)
        : await axios.post(`/api/posts/${postId}/likes`),
    onMutate: async () => {
      const queryKey: QueryKey = ["like-info", postId];

      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<LikeInfo>(queryKey);

      queryClient.setQueryData<LikeInfo>(queryKey, () => ({
        likes:
          (previousState?.likes || 0) + (previousState?.isLikedByUser ? -1 : 1),
        isLikedByUser: !previousState?.isLikedByUser,
      }));

      return { previousState };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousState) {
        queryClient.setQueryData<LikeInfo>(
          ["like-info", postId],
          context.previousState
        );
      }
      toast.error("Failed to update like status. Please try again.");
    },
    // onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: ["like-info", postId] });
    // },
  });

  return (
    <button className="flex items-center gap-2" onClick={() => mutate()}>
      <Heart
        className={cn(
          "size-5",
          data.isLikedByUser && "fill-red-500 text-red-500 "
        )}
      />
      <span className="text-sm font-medium tabular-nums">
        {data.likes} <span className="hidden sm:inline">likes</span>
      </span>
    </button>
  );
};
