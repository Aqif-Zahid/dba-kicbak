import ProfileSection from "@/components/profile/profile-section";
import { getServerSessionFromApi } from "@/lib/server-session";

export default async function ProfilesPage() {
  const session = await getServerSessionFromApi();

  if (!session?.user) {
    //  Trigger global error boundary (error.tsx)
    throw new Error("Unauthorized access ");
  }

  return <ProfileSection user={session.user} />;
}
