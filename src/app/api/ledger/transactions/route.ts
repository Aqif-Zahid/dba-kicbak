import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { RewardsReason } from "@prisma/client";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AppError } from "@/lib/ledger";
import { createLedgerTransaction } from "@/actions/ledger/ledger-actions";

/* ============================
   POST Body Schema (Create Transaction)
   ============================ */
const transactionBodySchema = z.object({
  type: z.enum(["SPEND", "BUY"]),
  amount: z.number().positive().finite(),
  narration: z.nativeEnum(RewardsReason).optional(),
});

/* ============================
   GET Query Schema (History Fetch)
   ============================ */
const querySchema = z.object({
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.enum(["DEBIT", "CREDIT"]).optional(),
  reason: z.nativeEnum(RewardsReason).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

/* ============================
   POST /api/ledger/transactions
   Create a new ledger transaction
   ============================ */
export const POST = async (req: NextRequest) => {
  try {
    const token = await getUser(req as any);
    if (!token || !token.id) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: No active session" },
        { status: 401 }
      );
    }

    // Load Treasury user from .env
    const treasuryEmail = process.env.TREASURY_EMAIL;
    if (!treasuryEmail) {
      return NextResponse.json(
        { status: 0, message: "Server misconfiguration: TREASURY_EMAIL not set" },
        { status: 500 }
      );
    }

    const treasury = await prisma.users.findUnique({
      where: { email: treasuryEmail },
    });
    if (!treasury) {
      return NextResponse.json(
        { status: 0, message: `Treasury user not found for ${treasuryEmail}` },
        { status: 500 }
      );
    }

    // Validate body
    const json = await req.json();
    const parsed = transactionBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { status: 0, message: parsed.error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { type, amount, narration } = parsed.data;
    const sessionUserId = Number(token.id);

    // Double-entry: choose debit/credit accounts
    const debitId = type === "SPEND" ? sessionUserId : treasury.id;
    const creditId = type === "SPEND" ? treasury.id : sessionUserId;

    const result = await createLedgerTransaction(
      debitId,
      creditId,
      amount,
      narration ?? RewardsReason.MANUAL_ADJUST
    );

    return NextResponse.json(
      {
        status: 1,
        message: "Transaction successful",
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Transaction Error:", error);

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

/* ============================
   GET /api/ledger/transactions
   Fetch paginated transaction history
   ============================ */
export const GET = async (req: NextRequest) => {
  try {
    const token = await getUser(req as any);
    if (!token || !token.id) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: No active session" },
        { status: 401 }
      );
    }

    const role = (token.role as string | null) ?? null;
    const sessionUserId = Number(token.id);

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return NextResponse.json(
        { status: 0, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { userId, startDate, endDate, type, reason, page, limit } = parsed.data;

    // Determine target user (Admin override)
    let targetUserId = sessionUserId;
    if (role === "ADMIN" && userId) {
      targetUserId = userId;
    }

    /* ============================
       Date Range Logic (Corrected)
       - Only apply createdAt filter if BOTH startDate and endDate are provided
       - Otherwise return full history
       ============================ */
    let createdAtFilter = undefined;

    if (startDate && endDate) {
      createdAtFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Pagination
    const currentPage = page && page > 0 ? page : 1;
    const pageLimit = limit && limit > 0 ? limit : 20;
    const skip = (currentPage - 1) * pageLimit;

    const where: any = {
      userId: targetUserId,
    };

    if (createdAtFilter) {
      where.createdAt = createdAtFilter;
    }

    if (type) where.transactionType = type;
    if (reason) where.reason = reason;

    const totalCount = await prisma.rewardsLedger.count({ where });
    const transactions = await prisma.rewardsLedger.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageLimit,
    });

    return NextResponse.json(
      {
        status: 1,
        message: "Transaction history fetched successfully",
        data: {
          transactions,
          totalCount,
          page: currentPage,
          limit: pageLimit,
          startDate: startDate || null,
          endDate: endDate || null,
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
