import { NextResponse } from "next/server";
import { getSessionUser, getUserLedgerSummary, AppError } from "@/lib/ledger";
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
});

/**
 * GET /api/ledger/summary
 * - Normal users: only their own ledger
 * - Admins: may pass ?userId=<id> to view someone else's
 */
export const GET = async (req: Request) => {
  try {
    const { userId: sessionUserId, role } = await getSessionUser(req);

    const { searchParams } = new URL(req.url);
    const queryObject: Record<string, string | undefined> = {
      userId: searchParams.get("userId") ?? undefined,
    };

    const parsed = querySchema.safeParse(queryObject);
    if (!parsed.success) {
      return NextResponse.json(
        { status: 0, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    let targetUserId = sessionUserId;
    const requestedUserId = parsed.data.userId;

    // Admin can override userId
    if (role === "ADMIN" && requestedUserId) {
      targetUserId = requestedUserId;
    }

    const summary = await getUserLedgerSummary(targetUserId);

    return NextResponse.json({
      status: 1,
      message: "Ledger summary fetched successfully",
      data: summary,
    });
  } catch (error: any) {
    console.error("Ledger summary error:", error);
    if (error instanceof AppError) {
      return NextResponse.json({ status: 0, message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { status: 0, message: error?.message || "Something went wrong" },
      { status: 500 }
    );
  }
};

export const dynamic = "force-dynamic";
