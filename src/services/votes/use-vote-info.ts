import { VoteInfo } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useVoteInfo = (postId: number, initialState: VoteInfo) => {
  const query = useQuery({
    queryKey: ["vote-info", postId],
    queryFn: async () => {
      const res = await axios.get(`/api/posts/${postId}/votes`);
      return res.data;
    },
    initialData: initialState,
    staleTime: Infinity, // 1 hour
  });

  return query;
};
