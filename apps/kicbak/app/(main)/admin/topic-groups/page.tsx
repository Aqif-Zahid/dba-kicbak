import { getServerSessionFromApi } from "@/lib/server-session";
import { TopicGroupsMain } from "@/components/admin/topic-groups/topic-groups-main";
import { Unauthorized } from "@/components/admin/unauthorized";

export default async function TopicGroupsPage() {
  const session = await getServerSessionFromApi();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return <Unauthorized />;
  }

  return <TopicGroupsMain />;
}