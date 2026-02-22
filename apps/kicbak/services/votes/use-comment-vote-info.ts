import { VoteInfo } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useCommentVoteInfo = (
  commentId: number,
  initialState: VoteInfo
) => {
  const query = useQuery({
    queryKey: ["comment-vote-info", commentId],
    queryFn: async () => {
      const res = await axios.get(`/api/comments/${commentId}/votes`);
      return res.data;
    },
    initialData: initialState,
    staleTime: Infinity, // 1 hour
  });

  return query;
};
