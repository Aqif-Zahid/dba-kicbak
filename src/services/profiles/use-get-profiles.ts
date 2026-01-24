import { Profile } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
type Response = {
  status: number;
  data: Profile[];
};

export const useGetProfiles = () => {
  return useQuery<Response>({
    queryKey: ["profiles"],
    queryFn: async () => {
      const response = await axios.get(`/api/profiles`);
      return response.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
};
