import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface UserPayload {
  userId: number;
  status: string;
}

interface ResponseType {
  status: number;
  message: string;
}
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, UserPayload>({
    mutationFn: async (payload) => {
      const response = await axios.put(`/api/users/update-status`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("User status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      toast.error("Something went wrong.");
    },
  });

  return mutation;
};
