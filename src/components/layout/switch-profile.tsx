import { User } from "@/types/types";
import { SwitchProfileClient } from "./switch-profile-client";
import prisma from "@/lib/prisma";

interface SwitchProfileProps {
  user: User;
}

export const SwitchProfile = async ({ user }: SwitchProfileProps) => {
  const profiles = await getProfiles(Number(user.id));
  return <SwitchProfileClient profiles={profiles} user={user} />;
};

async function getProfiles(userId: number) {
  const profiles = await prisma.profiles.findMany({
    where: { userId },
  });

  return profiles;
}
