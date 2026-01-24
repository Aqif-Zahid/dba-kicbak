import { TrendsSidebar } from "@/components/common/trends-sidebar";
import { NotificationsMain } from "@/components/notifications/notifications-main";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function NotificationsPage() {
  return (
    <main className="w-full min-w-0 flex gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold">Notifications</h1>
        </div>
        <NotificationsMain />
      </div>
      <TrendsSidebar />
    </main>
  );
}
