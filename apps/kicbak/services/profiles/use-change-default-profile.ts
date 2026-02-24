import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface Payload {
  id: number;
}

interface ResponseType {
  status: number;
  message: string;
}
export const useChangeDefaultProfile = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, Payload>({
    mutationFn: async (payload: Payload) => {
      const response = await axios.post(
        `/api/profiles/update-default-profile`,
        { newProfileId: payload.id }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Default profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: () => {
      toast.error("Failed to delete default profile");
    },
  });

  return mutation;
};
