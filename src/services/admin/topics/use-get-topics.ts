import { TopicGroup } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
type Response = {
  status: number;
  data: TopicGroup[];
};

export const useGetTopics = () => {
  return useQuery<Response>({
    queryKey: ["topics"],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/topics`);
      return response.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
};
