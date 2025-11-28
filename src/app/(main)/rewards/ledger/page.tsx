"use client";

import { LedgerList } from "@/components/ledger/ledger-list";

export const dynamic = "force-static";

const Page = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">
        Reward Ledger
      </h1>

      <LedgerList />
    </div>
  );
};

export default Page;
