import PageError from "@/components/common/error-page";
import { ConfigureRewardsForm } from "@/components/admin/configure-rewards/configure-rewards-form";
import { getServerSessionFromApi } from "@/lib/server-session";

type RewardsSettingsResponse =
  | {
      status: 1;
      message: string;
      data: {
        referrerPoints: number;
        referredPoints: number;
        lastUpdated: string | null;
      };
    }
  | { status: 0; message: string };

export default async function ConfigureRewardsPage() {
  // -------------------------
  // Authenticate user (via API session)
  // -------------------------
  const session = await getServerSessionFromApi();

  if (!session?.user || session.user.role !== "ADMIN") {
    return <PageError message="Unauthorized" />;
  }

  // -------------------------
  // Fetch reward settings from API
  // -------------------------
  const res = await fetch("http://localhost:3000/api/admin/configure-rewards", {
    cache: "no-store",
    headers: {
      cookie: (await import("next/headers")).headers().get("cookie") ?? "",
    },
  });

  const json = (await res.json().catch(() => null)) as RewardsSettingsResponse | null;

  if (!res.ok || !json || json.status !== 1) {
    return <PageError message={json?.message || "Failed to load reward settings"} />;
  }

  const { referrerPoints, referredPoints, lastUpdated } = json.data;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-2xl space-y-6">
      <h1 className="text-2xl font-bold text-center">Configure Rewards</h1>

      <ConfigureRewardsForm
        referrerPoints={referrerPoints || 0}
        referredPoints={referredPoints || 0}
        lastUpdated={lastUpdated}
      />
    </div>
  );
}
