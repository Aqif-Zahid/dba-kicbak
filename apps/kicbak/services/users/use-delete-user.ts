import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface ParamsType {
  userId: number;
}

interface ResponseType {
  status: number;
  message: string;
}
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, ParamsType>({
    mutationFn: async (params: ParamsType) => {
      const response = await axios.delete(`/api/users?id=${params.userId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("User deleted Successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      toast.error("Failed to delete User");
    },
  });

  return mutation;
};
