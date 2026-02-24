import { Coins } from "lucide-react";

export interface UnclaimedReward {
  id: number;
  amount: number;
  reason: string;
  refId?: number | null;
}

export interface ReferralRewardItemProps {
  reward: UnclaimedReward;
}

const getReasonMessage = (reward: UnclaimedReward) => {
  switch (reward.reason) {
    case "REFERRAL_SIGNUP":
      return "For signing up with a referral code";

    case "REFERRAL_ACTIVATION":
      return "For having a user sign up with your referral code";

    default:
      return "Reward received";
  }
};

export const ReferralRewardItem = ({ reward }: ReferralRewardItemProps) => {
  return (
    <div
      className="
        border rounded-lg p-3 flex items-center justify-between
        bg-gray-50 dark:bg-gray-900
        animate-fadeIn
      "
    >
      <div className="flex-1 pr-3">
        <p className="font-medium text-sm">
          {getReasonMessage(reward)}
        </p>
      </div>

      <div className="flex items-center gap-1 text-yellow-600 font-semibold">
        <Coins size={16} />
        {reward.amount}
      </div>
    </div>
  );
};
