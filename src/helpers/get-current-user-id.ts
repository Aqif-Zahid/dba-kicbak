import { Session } from "next-auth";

export const getCurrentUserId = (
  session: Session | null | undefined
): number | null => {
  if (!session?.user) return null;

  // Try to get id from your extended session
  const userId = (session.user as any).id;

  return userId ? Number(userId) : null;
};
