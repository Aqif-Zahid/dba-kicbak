import { TopicGroup } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
type Response = {
  status: number;
  data: TopicGroup[];
};

export const useGetTopicGroups = () => {
  return useQuery<Response>({
    queryKey: ["topic-groups"],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/topic-groups`);
      return response.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
};
