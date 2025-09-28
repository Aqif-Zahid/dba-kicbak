import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getUser } from "@/lib/auth";

// Zod schema for validation
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
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

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getUser(req);
    if (!currentUser) {
      return NextResponse.json(
        { message: "User Unauthorized!" },
        { status: 401 }
      );
    }

    // 🔹 Get user from DB
    if (!currentUser.email) {
      return NextResponse.json(
        { status: 0, message: "User email not found" },
        { status: 400 }
      );
    }
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, currentUser.email as string))
      .limit(1);

    const user = userResult[0];

    if (!user) {
      return NextResponse.json(
        { status: 0, message: "User not found" },
        { status: 404 }
      );
    }

    // 🔹 Parse request body
    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      return NextResponse.json(
        {
          error: "Validation failed",
          details: [
            ...Object.values(flattened.fieldErrors).flat(),
            ...flattened.formErrors,
          ],
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    // 🔹 Verify current password
    if (!user.passwordHash) {
      return NextResponse.json(
        { status: 0, message: "User does not have a password set" },
        { status: 400 }
      );
    }
    const isValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash as string
    );
    if (!isValid) {
      return NextResponse.json(
        { status: 0, message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // 🔹 Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 🔹 Update user password
    await db
      .update(users)
      .set({ passwordHash: hashedPassword })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      status: 1,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { status: 0, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
