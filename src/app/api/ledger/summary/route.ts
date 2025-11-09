import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserLedgerSummary, AppError } from "@/actions/ledger/ledger-actions";
import { getUser } from "@/lib/auth";

const querySchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, "userId must be a positive integer")
    .transform((val) => Number(val))
    .optional(),
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

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return NextResponse.json(
        { status: 0, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const role = (token.role as string | null) ?? null;
    let targetUserId = Number(token.id);

    if (role === "ADMIN" && parsed.data.userId) {
      targetUserId = parsed.data.userId;
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
