"use server";

import prisma from "@/lib/prisma";
import { RewardsReason, TransactionType } from "@prisma/client";
import {
  AppError,
  wrapError,
  transactionSchema,
  userIdSchema,
  dateRangeSchema,
  toNumberSafe,
} from "@/lib/ledger";

/**
 * Creates a double-entry transaction in the rewards ledger.
 * Treasury = claimed TRUE + treasury snapshot decremented
 * User     = claimed FALSE (until user clicks "claim")
 */
export const createLedgerTransaction = async (
  debitId: number,    // treasury
  creditId: number,   // user
  amount: number,
  reason: RewardsReason,
  refId?: number
) => {
  try {
    const parsed = transactionSchema.safeParse({
      debitId,
      creditId,
      amount,
      reason,
      refId,
    });
    if (!parsed.success) throw parsed.error;

    if (debitId === creditId) {
      throw new AppError(
        400,
        "INVALID_LEDGER_PAIR",
        "Debit and credit IDs must be different"
      );
    }

    return await prisma.$transaction(async (tx) => {
      /**
       * =============================
       * 1) TREASURY DEBIT ENTRY
       * =============================
       */
      const debitEntry = await tx.rewardsLedger.create({
        data: {
          userId: debitId,
          deltaPoints: amount,
          reason,
          refId,
          transactionType: TransactionType.DEBIT,
          claimed: true, // treasury debit is instantly claimed
        },
      });

      /**
       * Decrement treasury snapshot
       */
      await tx.users.update({
        where: { id: debitId },
        data: { points: { decrement: amount } },
      });

      /**
       * =============================
       * 2) USER CREDIT ENTRY (pending claim)
       * =============================
       */
      const creditEntry = await tx.rewardsLedger.create({
        data: {
          userId: creditId,
          deltaPoints: amount,
          reason,
          refId,
          transactionType: TransactionType.CREDIT,
          claimed: false, // pending until user claims
        },
      });

      /**
       * IMPORTANT:
       * Do NOT increment user.points here.
       * User snapshot updates ONLY in /api/rewards POST.
       */

      return { debitEntry, creditEntry };
    });
  } catch (e) {
    throw wrapError(
      e,
      "Failed to create ledger transaction",
      "LEDGER_TRANSACTION_FAILED"
    );
  }
};

/**
 * Returns total debit, total credit and net balance for a user.
 * ONLY counts claimed entries (fixes UI showing unclaimed rewards early)
 */
export const getUserLedgerSummary = async (userId: number) => {
  try {
    const parsed = userIdSchema.safeParse(userId);
    if (!parsed.success) throw parsed.error;

    const result = await prisma.$queryRaw<
      { total_debit: number | null; total_credit: number | null }[]
    >`
      SELECT
        COALESCE(SUM(CASE 
          WHEN "transaction_type" = 'DEBIT' AND "claimed" = true 
          THEN "delta_points" ELSE 0 END)::double precision, 0) AS total_debit,
        COALESCE(SUM(CASE 
          WHEN "transaction_type" = 'CREDIT' AND "claimed" = true 
          THEN "delta_points" ELSE 0 END)::double precision, 0) AS total_credit
      FROM "rewards_ledger"
      WHERE "user_id" = ${userId};
    `;

    const totals = result[0] || { total_debit: 0, total_credit: 0 };
    const totalDebit = toNumberSafe(totals.total_debit);
    const totalCredit = toNumberSafe(totals.total_credit);

    return {
      totalDebit,
      totalCredit,
      balance: totalCredit - totalDebit, // only claimed entries
    };
  } catch (e) {
    throw wrapError(
      e,
      "Failed to fetch ledger summary",
      "LEDGER_SUMMARY_FAILED"
    );
  }
};

/**
 * Returns ledger transactions + summary within date range.
 * ALSO excludes unclaimed entries from summary.
 */
export const getUserLedgerData = async (
  userId: number,
  startDate?: Date,
  endDate?: Date
) => {
  try {
    const parsedUserId = userIdSchema.safeParse(userId);
    if (!parsedUserId.success) throw parsedUserId.error;

    const now = new Date();
    const defaultStart = new Date(now);
    defaultStart.setDate(now.getDate() - 7);

    const finalStart = startDate ?? defaultStart;
    const finalEnd = endDate ?? now;

    const parsedDates = dateRangeSchema.safeParse({
      startDate: finalStart,
      endDate: finalEnd,
    });
    if (!parsedDates.success) throw parsedDates.error;

    const summaryResult = await prisma.$queryRaw<
      { total_debit: number | null; total_credit: number | null }[]
    >`
      SELECT
        COALESCE(SUM(CASE 
          WHEN "transaction_type" = 'DEBIT' AND "claimed" = true 
          THEN "delta_points" ELSE 0 END)::double precision, 0) AS total_debit,
        COALESCE(SUM(CASE 
          WHEN "transaction_type" = 'CREDIT' AND "claimed" = true 
          THEN "delta_points" ELSE 0 END)::double precision, 0) AS total_credit
      FROM "rewards_ledger"
      WHERE "user_id" = ${userId}
        AND "created_at" BETWEEN ${finalStart} AND ${finalEnd};
    `;

    const totals = summaryResult[0] || { total_debit: 0, total_credit: 0 };
    const totalDebit = toNumberSafe(totals.total_debit);
    const totalCredit = toNumberSafe(totals.total_credit);

    /**
     * Full transaction list (claimed + unclaimed)
     * Unclaimed still appear in list, they are NOT counted toward balance.
     */
    const rawTransactions = await prisma.rewardsLedger.findMany({
      where: {
        userId,
        createdAt: { gte: finalStart, lte: finalEnd },
      },
      orderBy: { createdAt: "desc" },
    });

    const transactions = rawTransactions.map((t) => ({
      ...t,
      userId: toNumberSafe((t as any).userId),
      deltaPoints: toNumberSafe((t as any).deltaPoints),
      refId: t.refId == null ? null : toNumberSafe((t as any).refId),
    }));

    return {
      totalDebit,
      totalCredit,
      balance: totalCredit - totalDebit,
      transactions,
      startDate: finalStart,
      endDate: finalEnd,
    };
  } catch (e) {
    throw wrapError(e, "Failed to fetch ledger data", "LEDGER_DATA_FAILED");
  }
};
