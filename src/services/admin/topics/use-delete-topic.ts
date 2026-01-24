import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface ParamsType {
  id: number;
}

interface ResponseType {
  status: number;
  message: string;
}
export const useDeleteTopic = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, ParamsType>({
    mutationFn: async (params: ParamsType) => {
      const response = await axios.delete(`/api/admin/topics?id=${params.id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Topic deleted Successfully!");
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
    onError: () => {
      toast.error("Failed to delete topic");
    },
  });

  return mutation;
};
