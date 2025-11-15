import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface Payload {
  id: number; // community ID to join
}

interface ResponseType {
  status: number;
  message: string;
}

export const useJoinCommunity = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, any, Payload>({
    mutationFn: async (payload) => {
      const response = await axios.post(`/api/communities/${payload.id}/join`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Joined community successfully!");
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to join community");
    },
  });

  return mutation;
};
