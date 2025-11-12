import { NextResponse } from "next/server";
import { z } from "zod";
import { RewardsReason } from "@prisma/client";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AppError } from "@/lib/ledger";
import { createLedgerTransaction } from "@/actions/ledger/ledger-actions";

const transactionBodySchema = z.object({
  type: z.enum(["SPEND", "BUY"]),
  amount: z.number().positive().finite(),
  narration: z.nativeEnum(RewardsReason).optional(),
});

export const POST = async (req: Request) => {
  try {
    const token = await getUser(req as any);
    if (!token || !token.id) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: No active session" },
        { status: 401 }
      );
    }

    // Dynamically get Treasury user via .env
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

    const json = await req.json();
    const parsed = transactionBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { status: 0, message: parsed.error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { type, amount, narration } = parsed.data;
    const sessionUserId = Number(token.id);

    const debitId = type === "SPEND" ? sessionUserId : treasury.id;
    const creditId = type === "SPEND" ? treasury.id : sessionUserId;

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
