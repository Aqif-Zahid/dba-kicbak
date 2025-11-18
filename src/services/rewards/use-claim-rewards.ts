"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useClaimRewards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await axios.post("/api/rewards");

      if (res.data.status === 0) {
        throw new Error(res.data.message || "Failed to claim rewards");
      }

      return res.data.data; 
      // { claimedAmount, newBalance }
    },

    onSuccess: () => {
      // Refresh reward list & ledger summary
      queryClient.invalidateQueries({ queryKey: ["unclaimed-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["ledger-summary"] });
    },
  });
};
