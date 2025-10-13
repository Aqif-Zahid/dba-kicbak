import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface Payload {
  id?: number;
  username: string;
  displayName: string;
  bio?: string;
}
interface ResponseType {
  status: number;
  message: string;
}
export const useManageProfile = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, Payload>({
    mutationFn: async (payload) => {
      const response = payload.id
        ? await axios.patch(`/api/profiles`, payload)
        : await axios.post(`/api/profiles`, payload);
      return response.data;
    },
    onSuccess: (_record, payload) => {
      toast.success(
        `Profile ${payload.id ? "updated" : "created"}  Successfully! `
      );
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: (_record, payload) => {
      toast.error(`Failed to ${payload.id ? "update" : "create"}  profile! `);
    },
  });

  return mutation;
};
