import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export const useUserLedgerSummary = () => {
  return useQuery({
    queryKey: ["user-ledger-summary"],
    queryFn: async () => {
      const res = await axios.get("/api/ledger/summary");

      if (res.data.status === 0) {
        throw new Error(res.data.message || "Failed to fetch ledger summary");
      }

      return res.data.data; // { totalDebit, totalCredit, balance }
    },
  });
};
