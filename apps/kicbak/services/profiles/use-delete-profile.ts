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
export const useDeleteProfile = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, ParamsType>({
    mutationFn: async (params: ParamsType) => {
      const response = await axios.delete(`/api/profiles?id=${params.id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Profile deleted Successfully!");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: () => {
      toast.error("Failed to delete profile");
    },
  });

  return mutation;
};
