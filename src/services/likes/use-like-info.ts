import { LikeInfo } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useLikeInfo = (postId: number, initialState: LikeInfo) => {
  const query = useQuery({
    queryKey: ["like-info", postId],
    queryFn: async () => {
      const res = await axios.get(`/api/posts/${postId}/likes`);
      return res.data;
    },
    initialData: initialState,
    staleTime: Infinity, // 1 hour
  });

  return query;
};
