"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import { useUnclaimedRewards } from "@/services/rewards/use-unclaimed-rewards";
import { useClaimRewards } from "@/services/rewards/use-claim-rewards";
import { useState } from "react";

import {
  ReferralRewardItem,
  UnclaimedReward,
} from "./referral-reward-item";

interface ClaimRewardsDialogProps {
  open: boolean;
  onClose: () => void;
  onClaimSuccess?: (amount: number) => void;
}

export const ClaimRewardsDialog = ({
  open,
  onClose,
  onClaimSuccess,
}: ClaimRewardsDialogProps) => {
  const { data, isLoading, refetch } = useUnclaimedRewards();
  const { mutate: claimRewards, isPending } = useClaimRewards();

  const [claimed, setClaimed] = useState(false);

  if (!open) return null;

  const handleClaim = () => {
    claimRewards(undefined, {
      onSuccess: async (response: any) => {
        setClaimed(true);

        const totalClaimed = response?.claimedAmount ?? 0;

        if (totalClaimed > 0) {
          onClaimSuccess?.(totalClaimed);
        }

        await refetch();

        setTimeout(() => {
          onClose();
          setClaimed(false);
        }, 800);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Claim Your Rewards
          </DialogTitle>
          <DialogDescription>
            You have unclaimed rewards waiting for you!
          </DialogDescription>
        </DialogHeader>

        {/* Rewards List */}
        <div className="space-y-3 py-2">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading rewards...</p>
          )}

          {!isLoading &&
            data?.rewards?.map((reward: UnclaimedReward) => (
              <ReferralRewardItem key={reward.id} reward={reward} />
            ))}
        </div>

        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={handleClaim}
            className="w-full font-semibold"
          >
            {isPending
              ? "Claiming..."
              : claimed
              ? "Claimed!"
              : "Claim All Rewards"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
