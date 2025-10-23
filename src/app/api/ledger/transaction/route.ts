import { NextResponse } from "next/server";
import {
  createLedgerTransaction,
  getSessionUser,
  AppError,
} from "@/lib/ledger";
import { RewardsReason } from "@prisma/client";
import { z } from "zod";

const TREASURY_ID = 1;

/**
 * Zod schema for transaction body
 */
const transactionBodySchema = z.object({
  type: z.enum(["SPEND", "BUY"], {
    required_error: "Transaction type is required",
    invalid_type_error: "Transaction type must be SPEND or BUY",
  }),
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be greater than zero")
    .finite(),
  narration: z.nativeEnum(RewardsReason).optional(),
});

/**
 * POST /api/ledger/transaction
 * Handles:
 * - SPEND (user → treasury)
 * - BUY (treasury → user)
 */
export const POST = async (req: Request) => {
  try {
    const { userId: sessionUserId } = await getSessionUser(req);

    const json = await req.json();
    const parsed = transactionBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          status: 0,
          message: parsed.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { type, amount, narration } = parsed.data;

    const debitId = type === "SPEND" ? sessionUserId : TREASURY_ID;
    const creditId = type === "SPEND" ? TREASURY_ID : sessionUserId;

    const result = await createLedgerTransaction(
      debitId,
      creditId,
      amount,
      narration ?? RewardsReason.MANUAL_ADJUST
    );

    return NextResponse.json({
      status: 1,
      message: "Transaction successful",
      data: result,
    });
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
