import { NextResponse } from "next/server";
import { getSessionUser, AppError } from "@/lib/ledger";
import prisma from "@/lib/prisma";
import { RewardsReason } from "@prisma/client";
import { z } from "zod";

/**
 * Zod schema for query validation
 */
const querySchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, "userId must be a positive integer")
    .transform((val) => Number(val))
    .optional(),
  startDate: z
    .string()
    .datetime({ message: "startDate must be a valid ISO date string" })
    .optional(),
  endDate: z
    .string()
    .datetime({ message: "endDate must be a valid ISO date string" })
    .optional(),
  type: z.enum(["DEBIT", "CREDIT"]).optional(),
  reason: z.nativeEnum(RewardsReason).optional(),
  page: z
    .string()
    .regex(/^\d+$/, "page must be a positive integer")
    .transform((val) => Number(val))
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "limit must be a positive integer")
    .transform((val) => Number(val))
    .optional(),
});

/**
 * GET /api/ledger/transactions
 * - Normal users: view own transactions
 * - Admin: can view any user's transactions via ?userId=
 * Filters: date range (default: last 7 days), type, reason, pagination
 */
export const GET = async (req: Request) => {
  try {
    const { userId: sessionUserId, role } = await getSessionUser(req);

    // ✅ Parse query params through Zod
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return NextResponse.json(
        { status: 0, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { userId, startDate, endDate, type, reason, page, limit } = parsed.data;

    // 🧠 Determine target user based on role
    let targetUserId = sessionUserId;
    if (role === "ADMIN" && userId) {
      targetUserId = userId;
    }

    // 🕒 Date range (default: last 7 days)
    const now = new Date();
    const defaultStart = new Date(now);
    defaultStart.setDate(now.getDate() - 7);

    const finalStart = startDate ? new Date(startDate) : defaultStart;
    const finalEnd = endDate ? new Date(endDate) : now;

    // 📄 Pagination
    const currentPage = page && page > 0 ? page : 1;
    const pageLimit = limit && limit > 0 ? limit : 20;
    const skip = (currentPage - 1) * pageLimit;

    // 🧭 Build where clause
    const whereClause: any = {
      userId: targetUserId,
      createdAt: { gte: finalStart, lte: finalEnd },
    };
    if (type) whereClause.transactionType = type;
    if (reason) whereClause.reason = reason;

    // 📊 Count total records
    const totalCount = await prisma.rewardsLedger.count({ where: whereClause });

    // 🧾 Get transactions sorted latest → oldest
    const rawTransactions = await prisma.rewardsLedger.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageLimit,
    });

    // 🧮 Safe number conversion
    const toNumberSafe = (v: unknown): number => {
      if (v === null || v === undefined) return 0;
      if (typeof v === "number") return v;
      if (typeof v === "bigint") return Number(v);
      if (typeof v === "string") return Number(v);
      if (
        typeof v === "object" &&
        v !== null &&
        "toNumber" in (v as any) &&
        typeof (v as any).toNumber === "function"
      ) {
        return (v as any).toNumber();
      }
      return Number(v);
    };

    const transactions = rawTransactions.map((t) => ({
      ...t,
      userId: toNumberSafe((t as any).userId),
      deltaPoints: toNumberSafe((t as any).deltaPoints),
      refId: t.refId == null ? null : toNumberSafe((t as any).refId),
    }));

    return NextResponse.json(
      {
        status: 1,
        message: "Transaction history fetched successfully",
        data: {
          transactions,
          totalCount,
          page: currentPage,
          limit: pageLimit,
          startDate: finalStart,
          endDate: finalEnd,
          filterType: type || null,
          filterReason: reason || null,
          targetUserId,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Transaction history fetch error:", error);
    if (error instanceof AppError) {
      return NextResponse.json(
        { status: 0, message: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { status: 0, message: error?.message || "Something went wrong" },
      { status: 500 }
    );
  }
};
