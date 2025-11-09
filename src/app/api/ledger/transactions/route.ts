import { NextResponse } from "next/server";
import { AppError } from "@/actions/ledger/ledger-actions";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { RewardsReason } from "@prisma/client";
import { z } from "zod";

const querySchema = z.object({
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.enum(["DEBIT", "CREDIT"]).optional(),
  reason: z.nativeEnum(RewardsReason).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export const GET = async (req: Request) => {
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

    let targetUserId = sessionUserId;
    if (role === "ADMIN" && userId) targetUserId = userId;

    const now = new Date();
    const defaultStart = new Date(now);
    defaultStart.setDate(now.getDate() - 7);

    const finalStart = startDate ? new Date(startDate) : defaultStart;
    const finalEnd = endDate ? new Date(endDate) : now;

    const currentPage = page && page > 0 ? page : 1;
    const pageLimit = limit && limit > 0 ? limit : 20;
    const skip = (currentPage - 1) * pageLimit;

    const where: any = {
      userId: targetUserId,
      createdAt: { gte: finalStart, lte: finalEnd },
    };
    if (type) where.transactionType = type;
    if (reason) where.reason = reason;

    const totalCount = await prisma.rewardsLedger.count({ where });
    const transactions = await prisma.rewardsLedger.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageLimit,
    });

    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error("Transaction history fetch error:", error);
    if (error instanceof AppError) {
      return NextResponse.json({ status: 0, message: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { status: 0, message: error?.message || "Something went wrong" },
      { status: 500 }
    );
  }
};
