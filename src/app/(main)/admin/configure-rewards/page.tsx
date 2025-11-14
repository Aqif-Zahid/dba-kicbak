import prisma from "@/lib/prisma";
import PageError from "@/components/common/error-page";
import { ConfigureRewardsForm } from "@/components/admin/configure-rewards/configure-rewards-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ConfigureRewardsPage() {
  // -------------------------
  // Authenticate user (server-safe)
  // -------------------------
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return <PageError message="Unauthorized" />;
  }

  // -------------------------
  // Fetch reward settings
  // -------------------------
  const settings = await prisma.systemSettings.findMany({
    where: {
      key: { in: ["referrer_reward_points", "referred_reward_points"] },
    },
  });

  const data: Record<string, any> = {};
  settings.forEach((s) => (data[s.key] = Number(s.value)));

  const lastUpdated =
    settings.reduce(
      (latest, s) => (s.updatedAt > latest ? s.updatedAt : latest),
      new Date(0)
    ) || null;

  // -------------------------
  // Render component
  // -------------------------
  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-2xl space-y-6">
      <h1 className="text-2xl font-bold text-center">Configure Rewards</h1>

      <ConfigureRewardsForm
        referrerPoints={data.referrer_reward_points || 0}
        referredPoints={data.referred_reward_points || 0}
        lastUpdated={lastUpdated ? lastUpdated.toISOString() : null}
      />
    </div>
  );
}
