import { FollowerInfo } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useFollowerInfo = (userId: string, initialState: FollowerInfo) => {
  const query = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: async () => {
      const res = await axios.get(`/api/users/${userId}/followers`);
      return res.data;
    },
    initialData: initialState,
    staleTime: Infinity, // 1 hour
  });
  return query;
};
