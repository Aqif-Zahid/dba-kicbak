import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { TransactionType } from "@prisma/client";

/**
 * GET /api/rewards
 * Returns all unclaimed user CREDIT ledger entries.
 */
export const GET = async (req: NextRequest) => {
  try {
    const token = await getUser(req as any);
    if (!token?.id) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: No active session" },
        { status: 401 }
      );
    }

    const userId = Number(token.id);

    const rewards = await prisma.rewardsLedger.findMany({
      where: {
        userId,
        claimed: false,
        transactionType: TransactionType.CREDIT,
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        deltaPoints: true,
        reason: true,
        refId: true,
        createdAt: true,
      },
    });

    const normalized = rewards.map((r) => ({
      id: r.id,
      amount: r.deltaPoints,
      reason: r.reason,
      refId: r.refId,
      createdAt: r.createdAt,
    }));

    const totalAmount = normalized.reduce((sum, r) => sum + r.amount, 0);

    return NextResponse.json({
      status: 1,
      message: "Unclaimed rewards fetched successfully",
      data: { rewards: normalized, totalAmount },
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
 * Claim ALL unclaimed rewards:
 * - Mark rewards_ledger rows as claimed = true
 * - Increment user's points snapshot
 * ============================
 */
export const POST = async (req: NextRequest) => {
  try {
    const token = await getUser(req as any);
    if (!token?.id) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: No active session" },
        { status: 401 }
      );
    }

    const userId = Number(token.id);

    // Fetch unclaimed user CREDIT rewards
    const pending = await prisma.rewardsLedger.findMany({
      where: {
        userId,
        claimed: false,
        transactionType: TransactionType.CREDIT,
      },
    });

    if (pending.length === 0) {
      return NextResponse.json(
        { status: 0, message: "No rewards to claim" },
        { status: 400 }
      );
    }

    const totalAmount = pending.reduce(
      (sum, r) => sum + r.deltaPoints,
      0
    );

    const newBalance = await prisma.$transaction(async (tx) => {
      // Mark rows as claimed
      await tx.rewardsLedger.updateMany({
        where: { id: { in: pending.map((r) => r.id) } },
        data: { claimed: true },
      });

      // Increment user wallet balance
      const updated = await tx.users.update({
        where: { id: userId },
        data: { points: { increment: totalAmount } },
      });

      return updated.points ?? 0;
    });

    return NextResponse.json({
      status: 1,
      message: "Rewards claimed successfully",
      data: {
        claimedAmount: totalAmount,
        newBalance,
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
