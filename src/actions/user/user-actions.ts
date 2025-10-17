import prisma from "@/lib/prisma";

// Infer the type directly from Prisma model
export type ProfileDetails = Awaited<ReturnType<typeof getUserDetails>>;

export const getUserDetails = async (username: string) => {
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

export const checkUserMail = async (email: string) => {
  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });
    return user ?? null;
  } catch (e) {
    console.error("Error fetching user details by username:", e);
    return null;
  }
};
