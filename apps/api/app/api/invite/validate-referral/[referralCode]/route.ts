import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ referralCode: string }> }
) {
  try {
    const { referralCode } = await params;

    // Assumption: referral codes live in referral_codes table
    // We'll treat "exists" as valid for now.
    const code = await prisma.referral_codes.findFirst({
      where: { code: referralCode },
      select: { id: true },
    });

    return NextResponse.json({ status: 1, data: { valid: !!code } });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
