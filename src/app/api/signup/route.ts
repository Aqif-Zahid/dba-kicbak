import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { waitlistSignups, referralCodes, referrals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// === Zod validation ===
const signupSchema = z.object({
  email: z.string().email(),
  usernameDesired: z.string().min(3).max(20),
  personaSelected: z.array(z.string()).optional(),
  referralCode: z.string().optional(),
  source: z.string().optional(),
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
    email,
    usernameDesired,
    personaSelected = [],
    referralCode,
    source,
  } = parse.data;

  try {
    // 1. Check if already signed up
    const existingSignup = await db.query.waitlistSignups.findFirst({
      where: eq(waitlistSignups.email, email),
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

    // 3. Create waitlist signup
    const signupId = nanoid();

    await db.insert(waitlistSignups).values({
      email,
      usernameDesired,
      personaSelected,
      source,
      referralCode: validReferralCode,
      referrerUserId,
      inviteRequired: true,
      status: "UNCONFIRMED",
      createdAt: new Date(),
    });

    // 4. Track referral
    if (validReferralCode) {
      await db.insert(referrals).values({
        referrerUserId,
        referredEmail: email,
        referralCode: validReferralCode,
        signupId: signupId,
        status: "SIGNED_UP",
        createdAt: new Date(),
      });
    }

    // 5. Return success
    return NextResponse.json(
      {
        status: 1,
        message: "Signed up successfully",
        registrationStatus: "UNCONFIRMED",
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
