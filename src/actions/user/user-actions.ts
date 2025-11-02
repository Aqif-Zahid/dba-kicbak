import prisma from "@/lib/prisma";

// Infer the type directly from Prisma model
export type ProfileDetails = Awaited<ReturnType<typeof getUserDetails>>;

export const getUserDetails = async (referralCode: string) => {
  try {
    const referral = await prisma.referralCodes.findUnique({
      where: { code: referralCode },
      include: {
        users: true,
      },
    });

    return referral?.users ?? null;
  } catch (e) {
    console.error("Error fetching user details by referral code:", e);
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

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: Number(id) },
    });
    return user ?? null;
  } catch (e) {
    console.error("Error fetching user details by Id:", e);
    return null;
  }
};
