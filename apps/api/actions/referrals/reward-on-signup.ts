"use server";

import prisma from "@/lib/prisma";
import { RewardsReason } from "@prisma/client";
import { createLedgerTransaction } from "@/actions/ledger/ledger-actions";

/**
 * Handles referral reward creation ON SIGNUP.
 * Creates:
 *  - REFERRAL_ACTIVATION reward for referrer (unclaimed CREDIT)
 *  - REFERRAL_SIGNUP reward for referred user (unclaimed CREDIT)
 *
 * Duplicate protection:
 *  Prevent SAME user receiving SAME reward reason for SAME refId.
 *
 * Ledger rules
 *  Treasury DEBIT = claimed:true
 *  User CREDIT = claimed:false (pending)
 */
export const rewardOnReferralSignup = async (
  referrerUserId: number,
  referredUserId: number
) => {
  try {
    if (
      !referrerUserId ||
      !referredUserId ||
      referrerUserId === referredUserId
    ) {
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

    const referrerDuplicate = await prisma.rewardsLedger.findFirst({
      where: {
        userId: referrerUserId,
        reason: RewardsReason.REFERRAL_ACTIVATION,
        refId: referredUserId,
      },
    });

    if (referrerDuplicate) {
      return { status: 0, message: "Referrer reward already created" };
    }

    const referredDuplicate = await prisma.rewardsLedger.findFirst({
      where: {
        userId: referredUserId,
        reason: RewardsReason.REFERRAL_SIGNUP,
        refId: referrerUserId,
      },
    });

    if (referredDuplicate) {
      return { status: 0, message: "Referred reward already created" };
    }

    /**
     * ============================
     * Create DOUBLE-ENTRY rewards
     * ============================
     * Each reward becomes:
     *    Treasury DEBIT (claimed:true)
     *    User CREDIT (claimed:false)
     * via createLedgerTransaction()
     */
    await prisma.$transaction(async (tx) => {
      // Referrer reward
      if (referrerReward > 0) {
        await createLedgerTransaction(
          /* debit  */ (await tx.users.findFirst({ where: { email: process.env.TREASURY_EMAIL! } }))!.id,
          /* credit */ referrerUserId,
          /* amount */ referrerReward,
          /* reason */ RewardsReason.REFERRAL_ACTIVATION,
          /* refId  */ referredUserId
        );
      }

      // Referred reward
      if (referredReward > 0) {
        await createLedgerTransaction(
          (await tx.users.findFirst({ where: { email: process.env.TREASURY_EMAIL! } }))!.id,
          referredUserId,
          referredReward,
          RewardsReason.REFERRAL_SIGNUP,
          referrerUserId
        );
      }
    });

    return {
      status: 1,
      message: "Referral rewards created successfully",
    };
  } catch (error: any) {
    console.error("rewardOnReferralSignup error:", error);
    return {
      status: 0,
      message: error?.message || "Failed to create referral rewards",
    };
  }
};
