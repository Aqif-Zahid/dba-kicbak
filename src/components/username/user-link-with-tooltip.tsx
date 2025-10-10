"use client";

import { useQuery } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { UserTooltip } from "./user-tooltip";
import Link from "next/link";
import { Profile } from "@/types/types";
import axios, { AxiosError } from "axios";

interface UserLinkWithTooltipProps extends PropsWithChildren {
  username: string;
}

export const UserLinkWithTooltip = ({
  children,
  username,
}: UserLinkWithTooltipProps) => {
  const { data } = useQuery({
    queryKey: ["user-data", username],
    queryFn: async (): Promise<Profile> => {
      const response = await axios.get(`/api/users/username/${username}`);
      return response.data;
    },
    retry(failureCount, error) {
      if (error instanceof AxiosError && error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: Infinity,
  });

  if (!data) {
    return (
      <Link
        href={`/users/${username}`}
        className="text-primary hover:underline"
      >
        {children}
      </Link>
    );
  }
  return (
    <UserTooltip user={data}>
      <Link
        href={`/users/${username}`}
        className="text-primary hover:underline"
      >
        {children}
      </Link>
    </UserTooltip>
  );
};
