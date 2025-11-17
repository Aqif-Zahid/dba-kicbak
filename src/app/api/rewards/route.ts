import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import {
  RewardsReason,
  PendingRewardStatus,
} from "@prisma/client";

import { createLedgerTransaction } from "@/actions/ledger/ledger-actions";

/**
 * ============================
 * GET
 * Fetch all UNCLAIMED pending rewards for logged-in user
 * ============================
 */
export const GET = async (req: NextRequest) => {
  try {
    const token = await getUser(req as any);

    if (!token || !token.id) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: No active session" },
        { status: 401 }
      );
    }

    const userId = Number(token.id);

    // Fetch rewards INCLUDING sourceRefId
    const rewards = await prisma.pendingReward.findMany({
      where: { userId, status: PendingRewardStatus.UNCLAIMED },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        amount: true,
        reason: true,
        sourceRefId: true,
        createdAt: true,
      },
    });

    // Remap sourceRefId → refId
    const normalizedRewards = rewards.map((r) => ({
      ...r,
      refId: r.sourceRefId,
    }));

    const totalAmount = normalizedRewards.reduce((sum, r) => sum + r.amount, 0);

    return NextResponse.json({
      status: 1,
      message: "Unclaimed rewards fetched successfully",
      data: { rewards: normalizedRewards, totalAmount },
    });
  } catch (error: any) {
    console.error("GET /api/rewards error:", error);
    return NextResponse.json(
      { status: 0, message: "Failed to fetch unclaimed rewards" },
      { status: 500 }
    );
  }
};



/**
 * ============================
 * POST
 * Claim ALL pending rewards:
 * - Mark PendingReward as CLAIMED
 * - Create ledger DEBIT (treasury) + CREDIT (user) for EACH reward
 * - Update treasury & user balances
 * ============================
 */
export const POST = async (req: NextRequest) => {
  try {
    const token = await getUser(req as any);

    if (!token || !token.id) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: No active session" },
        { status: 401 }
      );
    }

    const userId = Number(token.id);

    const treasuryEmail = process.env.TREASURY_EMAIL;
    if (!treasuryEmail) {
      return NextResponse.json(
        { status: 0, message: "TREASURY_EMAIL not configured" },
        { status: 500 }
      );
    }

    const treasury = await prisma.users.findUnique({
      where: { email: treasuryEmail },
    });

    if (!treasury) {
      return NextResponse.json(
        { status: 0, message: "Treasury user not found" },
        { status: 500 }
      );
    }

    // Fetch unclaimed rewards
    const pendingRewards = await prisma.pendingReward.findMany({
      where: { userId, status: PendingRewardStatus.UNCLAIMED },
    });

    if (pendingRewards.length === 0) {
      return NextResponse.json(
        { status: 0, message: "No rewards to claim" },
        { status: 400 }
      );
    }

    const totalAmount = pendingRewards.reduce((sum, r) => sum + r.amount, 0);

    // Ensure treasury has enough funds
    const treasuryPoints = Number(treasury.points ?? 0);
    if (treasuryPoints < totalAmount) {
      return NextResponse.json(
        {
          status: 0,
          message: `Insufficient Treasury balance. Available: ${treasuryPoints}, required: ${totalAmount}`,
        },
        { status: 500 }
      );
    }

    /**
     * ============================
     * Perform ATOMIC transaction
     * ============================
     */
    const newUserBalance = await prisma.$transaction(async (tx) => {
      // 1. Mark all rewards as claimed
      await tx.pendingReward.updateMany({
        where: { userId, status: PendingRewardStatus.UNCLAIMED },
        data: { status: PendingRewardStatus.CLAIMED, claimedAt: new Date() },
      });

      // 2. Create ledger entries PER-REWARD correctly
      for (const reward of pendingRewards) {
        await createLedgerTransaction(
          treasury.id,             // debit treasury
          userId,                  // credit user
          reward.amount,
          reward.reason as RewardsReason,   // keep true reward reason
          reward.sourceRefId ?? undefined    // correct optional refId
        );
      }

      // 3. Adjust treasury balance
      await tx.users.update({
        where: { id: treasury.id },
        data: { points: { decrement: totalAmount } },
      });

      // 4. Adjust user balance
      const updatedUser = await tx.users.update({
        where: { id: userId },
        data: { points: { increment: totalAmount } },
      });

      return updatedUser.points;
    });

    return NextResponse.json({
      status: 1,
      message: "Rewards claimed successfully",
      data: {
        claimedAmount: totalAmount,
        newBalance: newUserBalance,
      },
    });
  } catch (error: any) {
    console.error("POST /api/rewards error:", error);
    return NextResponse.json(
      { status: 0, message: error?.message || "Failed to claim rewards" },
      { status: 500 }
    );
  }
};
