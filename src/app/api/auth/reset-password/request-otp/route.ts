import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

const OTP_TTL_MINUTES = 15;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { status: 0, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { status: 0, message: "No account found with this email address." },
        { status: 404 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await prisma.passwordResetOtp.create({
      data: {
        userId: user.id,
        otpHash: hashedOtp,
        expiresAt,
      },
    });

    const transporter = nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST,
      port: Number(process.env.NODEMAILER_PORT || 587),
      secure: false,
      auth: process.env.NODEMAILER_USER
        ? {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASSWORD || "",
          }
        : undefined,
    });

    await transporter.sendMail({
      to: email,
      from: process.env.NODEMAILER_USER || "no-reply@kicbak.local",
      subject: "Your Kicbak Password Reset Code",
      html: `
        <p>Here is your password reset code:</p>
        <h2 style="letter-spacing: 2px;">${otp}</h2>
        <p>This code will expire in ${OTP_TTL_MINUTES} minutes.</p>
      `,
    });

    return NextResponse.json({
      status: 1,
      message: "OTP sent successfully.",
      data: { expiresIn: OTP_TTL_MINUTES },
    });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json(
      { status: 0, message: "Internal server error." },
      { status: 500 }
    );
  }
}
