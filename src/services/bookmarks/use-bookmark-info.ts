import { BookmarkInfo } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useBookmarkInfo = (postId: number, initialState: BookmarkInfo) => {
  const query = useQuery({
    queryKey: ["bookmark-info", postId],
    queryFn: async () => {
      const res = await axios.get(`/api/posts/${postId}/bookmarks`);
      return res.data;
    },
    initialData: initialState,
    staleTime: Infinity, // 1 hour
  });

  return query;
};
