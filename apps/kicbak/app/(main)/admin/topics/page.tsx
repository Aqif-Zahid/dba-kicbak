import { getServerSessionFromApi } from "@/lib/server-session";
import { TopicsMain } from "@/components/admin/topics/topics-main";
import { Unauthorized } from "@/components/admin/unauthorized";

export default async function TopicsPage() {
  const session = await getServerSessionFromApi();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return <Unauthorized />;
  }

  return <TopicsMain />;
}
