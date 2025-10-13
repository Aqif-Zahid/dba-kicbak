import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProfileSection from "@/components/profile/ProfileSection";

export default async function ProfilesPage() {
  const session = await getServerSession(authOptions);
  const userId = Number((session?.user as any)?.id);

  if (!userId) {
    //  Trigger global error boundary (error.tsx)
    throw new Error("Unauthorized access — user ID missing.");
  }

  return <ProfileSection userId={userId} />;
}
