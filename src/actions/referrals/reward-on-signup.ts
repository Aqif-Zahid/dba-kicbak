"use server";

import prisma from "@/lib/prisma";
import { RewardsReason, PendingRewardStatus } from "@prisma/client";

/**
 * Create UNCLAIMED pending rewards for referrer + referred user.
 * No ledger updates, no treasury deductions, no direct point changes here.
 */
export const rewardOnReferralSignup = async (
  referrerUserId: number,
  referredUserId: number
) => {
  try {
    if (!referrerUserId || !referredUserId || referrerUserId === referredUserId) {
      throw new Error("Invalid referrer/referred user pair");
    }

    // Load reward settings
    const settings = await prisma.systemSettings.findMany({
      where: {
        key: {
          in: ["referrer_reward_points", "referred_reward_points"],
        },
      },
    });

    const referrerReward = Number(
      settings.find((s) => s.key === "referrer_reward_points")?.value ?? 0
    );

    const referredReward = Number(
      settings.find((s) => s.key === "referred_reward_points")?.value ?? 0
    );

    // Prevent duplicate reward creation for same referred user
    const existingPendingReward = await prisma.pendingReward.findFirst({
      where: {
        userId: referredUserId,
        reason: RewardsReason.REFERRAL_SIGNUP,
      },
    });

    if (existingPendingReward) {
      console.log("Pending reward already exists for this referral signup.");
      return { status: 0, message: "Reward already created" };
    }

    // Create pending rewards
    await prisma.$transaction(async (tx) => {

      // Referrer reward should be REFERRAL_ACTIVATION
      if (referrerReward > 0) {
        await tx.pendingReward.create({
          data: {
            userId: referrerUserId,
            amount: referrerReward,
            reason: RewardsReason.REFERRAL_ACTIVATION,  
            status: PendingRewardStatus.UNCLAIMED,
            sourceRefId: referredUserId,
          },
        });
      }

      // Referred user reward stays REFERRAL_SIGNUP
      if (referredReward > 0) {
        await tx.pendingReward.create({
          data: {
            userId: referredUserId,
            amount: referredReward,
            reason: RewardsReason.REFERRAL_SIGNUP,     
            status: PendingRewardStatus.UNCLAIMED,
            sourceRefId: referrerUserId,
          },
        });
      }
    });

    return {
      status: 1,
      message: "Pending referral rewards created successfully",
    };
  } catch (error: any) {
    console.error("rewardOnReferralSignup error:", error);
    return {
      status: 0,
      message: error?.message || "Failed to create referral pending rewards",
    };
  }
};
