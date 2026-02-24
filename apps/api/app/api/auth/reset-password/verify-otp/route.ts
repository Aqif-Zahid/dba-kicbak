import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    // 1. Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { status: 0, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // 2. Check if user exists
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { status: 0, message: "User not found" },
        { status: 404 }
      );
    }

    // 3. Find valid OTP
    const otpRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { status: 0, message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // 4. Compare hash
    const submittedHash = crypto.createHash("sha256").update(otp).digest("hex");
    if (submittedHash !== otpRecord.otpHash) {
      await prisma.passwordResetOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });

      return NextResponse.json(
        { status: 0, message: "Incorrect OTP" },
        { status: 400 }
      );
    }

    // 5. Mark OTP as used
    await prisma.passwordResetOtp.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({
      status: 1,
      message: "OTP verified successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { status: 0, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
