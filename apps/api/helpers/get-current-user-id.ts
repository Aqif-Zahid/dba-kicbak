import { Session } from "next-auth";

export const getCurrentProfileId = (
  session: Session | null | undefined
): number | null => {
  if (!session?.user) return null;
  // Try to get id from your extended session
  const profileId = (session.user as any).defaultProfileId;

  return profileId ? Number(profileId) : null;
};
