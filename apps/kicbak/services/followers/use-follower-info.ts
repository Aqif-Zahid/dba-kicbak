import { FollowerInfo } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useFollowerInfo = (
  profileId: number,
  initialState: FollowerInfo
) => {
  const query = useQuery({
    queryKey: ["follower-info", profileId],
    queryFn: async () => {
      const res = await axios.get(`/api/profiles/${profileId}/followers`);
      return res.data;
    },
    initialData: initialState,
    staleTime: Infinity, // 1 hour
  });
  return query;
};
