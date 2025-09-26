import { users } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export const getUserDetails = async (username: string) => {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    const user = result[0];
    return user;
  } catch (e) {
    console.log(e);
    return null;
  }
};
