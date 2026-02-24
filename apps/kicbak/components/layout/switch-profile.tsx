import { User } from "@/types/types";
import { SwitchProfileClient } from "./switch-profile-client";
import { headers } from "next/headers";
import { getApiBaseUrl } from "@/lib/server-session";

interface SwitchProfileProps {
  user: User;
}

export const SwitchProfile = async ({ user }: SwitchProfileProps) => {
  const profiles = await getProfiles(Number(user.id));
  return <SwitchProfileClient profiles={profiles} user={user} />;
};

async function getProfiles(_userId: number) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/profiles`, {
    cache: "no-store",
    headers: { cookie: headers().get("cookie") ?? "" },
  });

  if (!res.ok) return [];

  const json = await res.json();
  return json?.data ?? [];
}
