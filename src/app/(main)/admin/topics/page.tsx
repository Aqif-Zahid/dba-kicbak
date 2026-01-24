import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TopicsMain } from "@/components/admin/topics/topics-main";

export default async function TopicsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized access ");
  }

  return <TopicsMain />;
}
