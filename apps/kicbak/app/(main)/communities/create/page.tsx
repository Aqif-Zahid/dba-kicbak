import Loader from "@/components/common/loader";
import { CreateCommunityMain } from "@/components/communities/create-communities-main";
import { getServerSessionFromApi } from "@/lib/server-session";
import { Unauthorized } from "@/components/admin/unauthorized";
import { Suspense } from "react";

export default async function CreateCommunityPage() {
  const session = await getServerSessionFromApi();
  if (!session?.user) {
    return <Unauthorized />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <CreateCommunityMain />
    </Suspense>
  );
}
