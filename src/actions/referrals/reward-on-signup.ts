"use server";

import prisma from "@/lib/prisma";
import { RewardsReason, TransactionType } from "@prisma/client";

export const rewardOnReferralSignup = async (
  referrerUserId: number,
  referredUserId: number
) => {
  try {
    if (!referrerUserId || !referredUserId || referrerUserId === referredUserId)
      throw new Error("Invalid referrer/referred user pair");

    const treasuryEmail = process.env.TREASURY_EMAIL;
    if (!treasuryEmail) throw new Error("TREASURY_EMAIL not configured");

    const treasury = await prisma.users.findUnique({
      where: { email: treasuryEmail },
    });
    if (!treasury) throw new Error("Treasury user not found");

    const settings = await prisma.systemSettings.findMany({
      where: {
        key: { in: ["referrer_reward_points", "referred_reward_points"] },
      },
    });

    const referrerReward = Number(
      settings.find((s) => s.key === "referrer_reward_points")?.value || 0
    );
    const referredReward = Number(
      settings.find((s) => s.key === "referred_reward_points")?.value || 0
    );

    const totalDebit = referrerReward + referredReward;

    const treasuryPoints = Number(treasury.points ?? 0);
    if (treasuryPoints < totalDebit) {
      throw new Error(
        `Insufficient Treasury balance. Available: ${treasuryPoints}, required: ${totalDebit}`
      );
    }

    const existingReward = await prisma.rewardsLedger.findFirst({
      where: {
        userId: referredUserId,
        reason: RewardsReason.REFERRAL_SIGNUP,
      },
    });
    if (existingReward) {
      console.log("Referral reward already granted for this user.");
      return { status: 0, message: "Already rewarded" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.rewardsLedger.createMany({
        data: [
          {
            userId: treasury.id,
            deltaPoints: referrerReward,
            reason: RewardsReason.REFERRAL_SIGNUP,
            refId: referrerUserId,
            transactionType: TransactionType.DEBIT,
          },
          {
            userId: referrerUserId,
            deltaPoints: referrerReward,
            reason: RewardsReason.REFERRAL_SIGNUP,
            refId: referredUserId,
            transactionType: TransactionType.CREDIT,
          },
          {
            userId: treasury.id,
            deltaPoints: referredReward,
            reason: RewardsReason.REFERRAL_SIGNUP,
            refId: referredUserId,
            transactionType: TransactionType.DEBIT,
          },
          {
            userId: referredUserId,
            deltaPoints: referredReward,
            reason: RewardsReason.REFERRAL_SIGNUP,
            refId: referrerUserId,
            transactionType: TransactionType.CREDIT,
          },
        ],
      });

      await tx.users.update({
        where: { id: treasury.id },
        data: { points: { decrement: totalDebit } },
      });

      if (referrerReward > 0) {
        await tx.users.update({
          where: { id: referrerUserId },
          data: { points: { increment: referrerReward } },
        });
      }

      if (referredReward > 0) {
        await tx.users.update({
          where: { id: referredUserId },
          data: { points: { increment: referredReward } },
        });
      }
    });

    console.log(
      `Referral signup rewards processed: Treasury -${totalDebit}, Referrer +${referrerReward}, Referred +${referredReward}`
    );

    return {
      status: 1,
      message: "Referral rewards credited successfully",
    };
  } catch (error: any) {
    console.error("rewardOnReferralSignup error:", error);
    return {
      status: 0,
      message: error?.message || "Failed to process referral rewards",
    };
  }
};
