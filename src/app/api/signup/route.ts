import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { referralCodes, referrals, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

// === Zod validation ===
const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email(),
  usernameDesired: z.string().min(3).max(20),
  personaSelected: z.array(z.string()).optional(),
  referralCode: z.string().optional(),
  source: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(256, "Password must be at most 256 characters")
    .regex(
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
});

// === POST handler ===
export async function POST(req: Request) {
  const body = await req.json();
  const parse = signupSchema.safeParse(body);

  if (!parse.success) {
    return NextResponse.json(
      { status: 0, message: parse.error.flatten() },
      { status: 400 }
    );
  }

  const {
    firstName,
    lastName,
    email,
    usernameDesired,
    personaSelected = [],
    referralCode,
    source,
    password,
  } = parse.data;

  try {
    // 1. Check if already signed up
    const existingSignup = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingSignup) {
      return NextResponse.json({
        status: 0,
        message: "Already signed up",
        registrationStatus: existingSignup.status,
      });
    }

    // 2. Validate referral code
    let validReferralCode: string | null = null;
    let referrerUserId: string | null = null;

    if (referralCode) {
      const code = await db.query.referralCodes.findFirst({
        where: eq(referralCodes.code, referralCode),
      });

      if (!code || !code.active) {
        return NextResponse.json(
          { status: 0, message: "Invalid or inactive referral code" },
          { status: 400 }
        );
      }

      validReferralCode = code.code;
    }

    // 3. Create  signup
    const signupId = nanoid();
    const passwordHash = await bcrypt.hash(password, 10);
    const latestUser = await db.query.users.findFirst({
      orderBy: (u) => sql`CAST(${u.positionNumber} AS INT) DESC`, // cast to INT if stored as string
    });

    const positionNumber = latestUser
      ? Number(latestUser.positionNumber) + 1
      : 1000; // start from 1000 if no users exist

    await db.insert(users).values({
      positionNumber: positionNumber,
      displayName: `${firstName} ${lastName}`,
      email,
      usernameDesired,
      personaSelected,
      passwordHash,
      source,
      referralCode: validReferralCode,
      inviteRequired: true,
      status: "PENDING",
      role: "TRAVELER",
      createdAt: new Date(),
    });

    // // 4. Track referral
    // if (validReferralCode) {
    //   await db.insert(referrals).values({
    //     referrerUserId,
    //     referredEmail: email,
    //     referralCode: validReferralCode,
    //     signupId: signupId,
    //     status: "SIGNED_UP",
    //     createdAt: new Date(),
    //   });
    // }

    // 5. Return success
    return NextResponse.json(
      {
        status: 1,
        message: "Signed up successfully",
        registrationStatus: "PENDING",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup Error:", err);
    return NextResponse.json(
      { status: 0, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
