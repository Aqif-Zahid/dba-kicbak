import Loader from "@/components/common/loader";
import { CreateCommunityMain } from "@/components/communities/create-communities-main";
import { requireAuth } from "@/lib/auth-utils";
import { Suspense } from "react";

export default async function CreateCommunityPage() {
  await requireAuth();

  return (
    <Suspense fallback={<Loader />}>
      <CreateCommunityMain />
    </Suspense>
  );
}
