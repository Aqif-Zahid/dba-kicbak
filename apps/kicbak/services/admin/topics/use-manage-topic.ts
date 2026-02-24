import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface Payload {
  id?: number;
  title: string;
  description?: string;
  groupId: number;
}
interface ResponseType {
  status: number;
  message: string;
}
export const useManageTopic = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, Payload>({
    mutationFn: async (payload) => {
      const response = payload.id
        ? await axios.put(`/api/admin/topics`, payload)
        : await axios.post(`/api/admin/topics`, payload);
      return response.data;
    },
    onSuccess: (_record, payload) => {
      toast.success(
        `Topic ${payload.id ? "updated" : "created"}  Successfully! `
      );
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
    onError: (_record, payload) => {
      toast.error(`Failed to ${payload.id ? "update" : "create"}  topic! `);
    },
  });

  return mutation;
};
