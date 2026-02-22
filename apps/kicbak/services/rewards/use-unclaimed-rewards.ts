"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useUnclaimedRewards = () => {
  return useQuery({
    queryKey: ["unclaimed-rewards"],
    queryFn: async () => {
      const res = await axios.get("/api/rewards");

      if (res.data.status === 0) {
        throw new Error(res.data.message || "Failed to fetch rewards");
      }

      return res.data.data; // { rewards, totalAmount }
    },
    refetchInterval: 10000, // auto-refresh every 10 sec (optional)
  });
};
