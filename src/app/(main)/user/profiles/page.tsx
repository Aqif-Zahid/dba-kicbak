import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProfileSection from "@/components/profile/profile-section";

export default async function ProfilesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    //  Trigger global error boundary (error.tsx)
    throw new Error("Unauthorized access ");
  }

  return <ProfileSection user={session.user} />;
}
