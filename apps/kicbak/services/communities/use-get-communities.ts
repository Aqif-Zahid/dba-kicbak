import { Community } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
type Response = {
  status: number;
  data: Community[];
};

export const useGetCommunities = () => {
  return useQuery<Response>({
    queryKey: ["communities"],
    queryFn: async () => {
      const response = await axios.get(`/api/communities`);
      return response.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
};
