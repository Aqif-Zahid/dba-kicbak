import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { generateEmailAlias } from "@/lib/email-alias";

// === Zod validation ===
const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email(),
  usernameDesired: z.string().min(3).max(20),
  referralCode: z.string().min(3).max(20),
});

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

  const { firstName, lastName, email, usernameDesired, referralCode } =
    parse.data;

  try {
    // 1️⃣ Check if email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return NextResponse.json(
        { status: 0, message: "No user found with the email." },
        { status: 409 }
      );
    }

    if (existingUser.status !== "PENDING") {
      return NextResponse.json(
        { status: 0, message: "User has already an account with this email" },
        { status: 409 }
      );
    }

    // 2️⃣ Check for available username
    const userWithUserName = await prisma.profiles.findUnique({
      where: { username: usernameDesired },
    });

    if (!userWithUserName) {
      return NextResponse.json(
        { status: 0, message: "Username not available" },
        { status: 409 }
      );
    }

    //Later we will check for referral code

    //

    // 3️⃣ Transaction: Create user + default profile
    const result = await prisma.$transaction(async (tx: any) => {
      // 3a. Update User (activate + assign alias)
      await tx.users.update({
        where: { id: existingUser.id },
        data: {
          email: existingUser.email,
          status: "ACTIVE",
          referralCode,
          inviteRequired: false,
        },
      });

      // 3b. Create Default Profile
      const newProfile = await tx.profiles.create({
        data: {
          userId: existingUser.id,
          username: usernameDesired,
          displayName: `${firstName} ${lastName}`,
          role: "TRAVELER",
        },
      });

      if (!newProfile) throw new Error("Failed to create default profile.");

      // 3c. Update User with defaultProfileId
      await tx.users.update({
        where: { id: existingUser.id },
        data: { defaultProfileId: newProfile.id },
      });

      await streamServerClient.upsertUser({
        id: String(newProfile.id),
        username: usernameDesired,
        name: `${firstName} ${lastName}`,
      });

      return { userId: existingUser.id, profileId: newProfile.id };
    });

    // 4️⃣ Return success
    return NextResponse.json(
      {
        status: 1,
        message: "Profile completed successfully",
        userId: result.userId,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Complete Profile Error:", err);
    return NextResponse.json(
      { status: 0, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
