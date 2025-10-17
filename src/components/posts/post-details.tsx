"use client";
import axios from "axios";
import PageError from "../common/error-page";
import Loader from "../common/loader";
import { PostCard } from "./post-card";
import { useQuery } from "@tanstack/react-query";
interface PostDetailsProps {
  postId: string;
}

export const PostDetails = ({ postId }: PostDetailsProps) => {
  const { data, status } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const res = await axios.get(`/api/posts/${postId}`);
      return res.data;
    },
  });

  if (status === "pending") {
    return <Loader />;
  }

  if (status === "error") {
    return <PageError message="Unable to fetch post at this moment" />;
  }
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 space-y-5">
      <PostCard post={data.data} />
    </div>
  );
};
