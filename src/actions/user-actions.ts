import { profiles } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
export type ProfileDetails = typeof profiles.$inferSelect;

export const getUserDetails = async (username: string): Promise<ProfileDetails | null> => {
  try {
    const result = await db
      .select()
      .from(profiles)
      .where(eq(profiles.username, username))
      .limit(1);
      
    const profile = result[0];

    return profile ?? null;

  } catch (e) {
    console.error("Error fetching user details by username:", e);
    return null;
  }
};
