import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import streamServerClient from "@/lib/stream";

// === Zod validation ===
const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email(),
  usernameDesired: z.string().min(3).max(20),
  personaSelected: z.array(z.string()).optional(),
  referralCode: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(256, "Password must be at most 256 characters")
    .regex(
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
});

// === Helper function to resolve referrer ID ===
async function getReferrerId(referralCode?: string): Promise<number | null> {
  if (!referralCode) return null;

  const referralCodeRecord = await prisma.referralCodes.findUnique({
    where: { code: referralCode },
  });

  if (referralCodeRecord?.userId) {
    return referralCodeRecord.userId;
  }

  const referrerUser = await prisma.users.findFirst({
    where: { referralCode: referralCode },
  });

  return referrerUser ? referrerUser.id : null;
}

// === POST handler ===
export async function POST(req: Request) {
  const body = await req.json();
  const parse = signupSchema.safeParse(body);

  if (!parse.success) {
    return NextResponse.json(
      { status: 0, message: "Validation error", errors: parse.error.flatten() },
      { status: 400 }
    );
  }

  const {
    firstName,
    lastName,
    email,
    password,
    usernameDesired,
    personaSelected,
    referralCode,
  } = parse.data;

  try {
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return NextResponse.json(
        { status: 0, message: "No user found with the invite code." },
        { status: 409 }
      );
    }

    if (existingUser.status !== "PENDING") {
      return NextResponse.json(
        { status: 0, message: "User already has an account with this email" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const referrerId = await getReferrerId(referralCode);

    const result = await prisma.$transaction(async (tx: any) => {
      await tx.users.update({
        where: { id: existingUser.id },
        data: {
          passwordHash: hashedPassword,
          status: "ACTIVE",
          authProvider: "LOCAL",
          personaSelected: personaSelected ?? [],
          referralCode,
          referrerId: referrerId ?? null,
          inviteRequired: true,
        },
      });

      const newProfile = await tx.profiles.create({
        data: {
          userId: existingUser.id,
          username: usernameDesired,
          displayName: `${firstName} ${lastName}`,
          role: "TRAVELER",
        },
      });

      if (!newProfile) throw new Error("Failed to create default profile.");

      await tx.users.update({
        where: { id: existingUser.id },
        data: { defaultProfileId: newProfile.id },
      });

      if (referrerId) {
        await tx.referrals.create({
          data: {
            referrerUserId: referrerId,
            referredUserId: existingUser.id,
            referredEmail: email,
            referralCode: referralCode ?? null,
            status: "SIGNED_UP",
          },
        });
      }

      await streamServerClient.upsertUser({
        id: String(newProfile.id),
        username: usernameDesired,
        name: `${firstName} ${lastName}`,
      });

      return { userId: existingUser.id, profileId: newProfile.id };
    });

    return NextResponse.json(
      { status: 1, message: "Signed up successfully", userId: result.userId },
      { status: 200 }
    );
  } catch (err) {
    console.error("Signup Error:", err);
    return NextResponse.json(
      { status: 0, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
