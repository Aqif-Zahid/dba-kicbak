import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface Payload {
  id?: number;
  name: string;
  description?: string;
}
interface ResponseType {
  status: number;
  message: string;
}
export const useManageTopicGroup = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, Payload>({
    mutationFn: async (payload) => {
      const response = payload.id
        ? await axios.put(`/api/admin/topic-groups`, payload)
        : await axios.post(`/api/admin/topic-groups`, payload);
      return response.data;
    },
    onSuccess: (_record, payload) => {
      toast.success(
        `Topic group ${payload.id ? "updated" : "created"}  Successfully! `
      );
      queryClient.invalidateQueries({ queryKey: ["topic-groups"] });
    },
    onError: (_record, payload) => {
      toast.error(
        `Failed to ${payload.id ? "update" : "create"}  topic group! `
      );
    },
  });

  return mutation;
};
