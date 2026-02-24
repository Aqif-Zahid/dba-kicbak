// src/services/profiles/use-get-profiles-admin.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { ProfileAdmin } from "@/types/types"; // <-- use the global one

type Pagination = {
  total: number;
  totalPages: number;
};

type Response = {
  status: number;
  message?: string;
  data: ProfileAdmin[];
  pagination: Pagination;
};

export const useGetProfilesAdmin = (
  page: number,
  limit: number,
  search?: string,
  role?: string,
  status?: string
) => {
  return useQuery<Response>({
    queryKey: ["admin-profiles", page, limit, search, role, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      if (search) params.set("search", search);
      if (role) params.set("role", role);
      if (status) params.set("status", status);

      const res = await axios.get(`/api/admin/profiles?${params.toString()}`);
      return res.data as Response;
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
};
