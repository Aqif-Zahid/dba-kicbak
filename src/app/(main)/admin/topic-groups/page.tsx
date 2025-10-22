import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TopicGroupsMain } from "@/components/admin/topic-groups/topic-groups-main";

export default async function TopicGroupsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized access ");
  }

  return <TopicGroupsMain />;
}
