import { getErrorMessage } from "@/lib/utils";
import { User } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type Response = {
  status: number;
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
};

export const useGetUsers = (page: number, limit: number) => {
  return useQuery<Response>({
    queryKey: ["posts", limit],
    queryFn: async () => {
      const response = await axios.get(`/api/posts`, {
        params: {
          page,
          limit,
        },
      });

      if (response.status !== 200) {
        return {
          status: response.status,
          data: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
          message: getErrorMessage(response),
        };
      }

      return response.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
};
