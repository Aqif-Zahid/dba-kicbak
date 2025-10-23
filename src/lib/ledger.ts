import prisma from "@/lib/prisma";
import { RewardsReason, TransactionType } from "@prisma/client";
import { z } from "zod";
import { getUser } from "@/lib/auth";

/**
 * Centralized Error Type
 */
export class AppError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const wrapError = (e: unknown, fallbackMessage: string, code: string): never => {
  if (e instanceof AppError) throw e;
  // Surface known zod/prisma-ish validation issues as 400
  if (e instanceof z.ZodError) {
    throw new AppError(400, "VALIDATION_ERROR", e.message);
  }
  const msg = (e as any)?.message || fallbackMessage;
  throw new AppError(500, code, msg);
};

/**
 * Validation Schemas
 */
const transactionSchema = z.object({
  debitId: z.number().int().positive(),
  creditId: z.number().int().positive(),
  amount: z.number().positive().finite(),
  reason: z.nativeEnum(RewardsReason),
  refId: z.number().int().positive().optional(),
});

const userIdSchema = z.number().int().positive();

const dateRangeSchema = z
  .object({
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine((v) => v.startDate <= v.endDate, {
    message: "startDate must be less than or equal to endDate",
    path: ["startDate"],
  });

/**
 * Util: safe numeric conversion for bigint/Decimal/string → number
 */
const toNumberSafe = (v: unknown): number => {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "string") return Number(v);
  if (typeof v === "object" && "toNumber" in (v as any) && typeof (v as any).toNumber === "function") {
    return (v as any).toNumber();
  }
  return Number(v);
};

/**
 * Get logged-in user ID and role from session.
 */
export const getSessionUser = async (req: Request) => {
  try {
    const token = await getUser(req as any);
    if (!token || !token.id) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized: No active session");
    }
    return {
      userId: Number(token.id),
      role: (token.role as string | null) ?? null,
    };
  } catch (e) {
    throw wrapError(e, "Failed to read session user", "SESSION_USER_FAILED");
  }
};

/**
 * Creates a double-entry transaction in the rewards ledger.
 */
export const createLedgerTransaction = async (
  debitId: number,
  creditId: number,
  amount: number,
  reason: RewardsReason,
  refId?: number
) => {
  try {
    const parsed = transactionSchema.safeParse({ debitId, creditId, amount, reason, refId });
    if (!parsed.success) {
      throw parsed.error;
    }
    if (debitId === creditId) {
      throw new AppError(400, "INVALID_LEDGER_PAIR", "Debit and credit IDs must be different");
    }

    return await prisma.$transaction(async (tx) => {
      const debitEntry = await tx.rewardsLedger.create({
        data: {
          userId: debitId,
          deltaPoints: amount,
          reason,
          refId,
          transactionType: TransactionType.DEBIT,
        },
      });

      const creditEntry = await tx.rewardsLedger.create({
        data: {
          userId: creditId,
          deltaPoints: amount,
          reason,
          refId,
          transactionType: TransactionType.CREDIT,
        },
      });

      return { debitEntry, creditEntry };
    });
  } catch (e) {
    throw wrapError(e, "Failed to create ledger transaction", "LEDGER_TRANSACTION_FAILED");
  }
};

/**
 * Returns total debit, total credit and net balance for a user.
 */
export const getUserLedgerSummary = async (userId: number) => {
  try {
    const parsed = userIdSchema.safeParse(userId);
    if (!parsed.success) throw parsed.error;

    const result = await prisma.$queryRaw<
      { total_debit: number | null; total_credit: number | null }[]
    >`
      SELECT
        COALESCE(SUM(CASE WHEN "transaction_type" = 'DEBIT'  THEN "delta_points" ELSE 0 END)::double precision, 0) AS total_debit,
        COALESCE(SUM(CASE WHEN "transaction_type" = 'CREDIT' THEN "delta_points" ELSE 0 END)::double precision, 0) AS total_credit
      FROM "rewards_ledger"
      WHERE "user_id" = ${userId};
    `;

    const totals = result[0] || { total_debit: 0, total_credit: 0 };
    const totalDebit = toNumberSafe(totals.total_debit);
    const totalCredit = toNumberSafe(totals.total_credit);

    return {
      totalDebit,
      totalCredit,
      balance: totalDebit - totalCredit,
    };
  } catch (e) {
    throw wrapError(e, "Failed to fetch ledger summary", "LEDGER_SUMMARY_FAILED");
  }
};

/**
 * Returns ledger data (debit, credit, balance + transaction list) for a user within a date range.
 */
export const getUserLedgerData = async (
  userId: number,
  startDate?: Date,
  endDate?: Date
) => {
  try {
    const parsedUserId = userIdSchema.safeParse(userId);
    if (!parsedUserId.success) throw parsedUserId.error;

    // Default to last 7 days if no date range provided
    const now = new Date();
    const defaultStart = new Date(now);
    defaultStart.setDate(now.getDate() - 7);

    const finalStart = startDate ?? defaultStart;
    const finalEnd = endDate ?? now;

    const parsedDates = dateRangeSchema.safeParse({ startDate: finalStart, endDate: finalEnd });
    if (!parsedDates.success) throw parsedDates.error;

    // Summary (force numbers via double precision cast)
    const summaryResult = await prisma.$queryRaw<
      { total_debit: number | null; total_credit: number | null }[]
    >`
      SELECT
        COALESCE(SUM(CASE WHEN "transaction_type" = 'DEBIT'  THEN "delta_points" ELSE 0 END)::double precision, 0) AS total_debit,
        COALESCE(SUM(CASE WHEN "transaction_type" = 'CREDIT' THEN "delta_points" ELSE 0 END)::double precision, 0) AS total_credit
      FROM "rewards_ledger"
      WHERE "user_id" = ${userId}
        AND "created_at" BETWEEN ${finalStart} AND ${finalEnd};
    `;

    const totals = summaryResult[0] || { total_debit: 0, total_credit: 0 };
    const totalDebit = toNumberSafe(totals.total_debit);
    const totalCredit = toNumberSafe(totals.total_credit);

    // Transaction list (latest → oldest)
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
      balance: totalDebit - totalCredit,
      transactions,
      startDate: finalStart,
      endDate: finalEnd,
    };
  } catch (e) {
    throw wrapError(e, "Failed to fetch ledger data", "LEDGER_DATA_FAILED");
  }
};
