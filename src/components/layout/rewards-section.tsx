"use client";

import { useState } from "react";
import { ClaimRewardsDialog } from "../rewards/claim-rewards-dialog";
import { UserPointsBadge } from "../common/user-points-badge";

interface RewardsSectionProps {
  user: any;
}

export const RewardsSection = ({ user }: RewardsSectionProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!user) return null;

  const handleClaimSuccess = (totalClaimed: number) => {
    // Trigger animation inside UserPointsBadge
    window.dispatchEvent(
      new CustomEvent("points-claimed", { detail: totalClaimed })
    );
  };

  return (
    <div className="relative flex items-center gap-3">
      <UserPointsBadge onClick={() => setDialogOpen(true)} />

      <ClaimRewardsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onClaimSuccess={handleClaimSuccess}
      />
    </div>
  );
};
