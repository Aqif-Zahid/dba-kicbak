import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CreateCommunityMain } from "@/components/communities/create-communities-main";

export default async function CreateCommunityPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized access ");
  }

  return <CreateCommunityMain />;
}
