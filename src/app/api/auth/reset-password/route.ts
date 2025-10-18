import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

//  Reuse same password strength rules as change-password
const resetPasswordSchema = z
  .object({
    email: z.string().email("Valid email is required"),
    otp: z.string().min(6, "OTP is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    //  1. Validate input
    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      return NextResponse.json(
        {
          status: 0,
          message: "Validation failed",
          errors: [
            ...Object.values(flattened.fieldErrors).flat(),
            ...flattened.formErrors,
          ],
        },
        { status: 400 }
      );
    }

    const { email, otp, newPassword } = parsed.data;

    //  2. Check if user exists
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { status: 0, message: "User not found" },
        { status: 404 }
      );
    }

    //  3. Hash & update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    return NextResponse.json({
      status: 1,
      message: "Password reset successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { status: 0, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
