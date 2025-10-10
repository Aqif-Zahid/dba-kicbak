import prisma from "@/lib/prisma";
import { Profile } from "@/types/types";

export const getUserDetails = async (
  username: string
): Promise<Profile | null> => {
  try {
    const profile = await prisma.profiles.findUnique({
      where: { username },
    });

    return profile ?? null;
  } catch (e) {
    console.error("Error fetching user details by username:", e);
    return null;
  }
};
