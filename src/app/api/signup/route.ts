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
    source,
  } = parse.data;

  try {
    // 1️⃣ Check if email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { status: 0, message: "A user with this email already exists." },
        { status: 409 }
      );
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Transaction: Create user + default profile
    const result = await prisma.$transaction(async (tx: any) => {
      // 3a. Create User
      const newUser = await tx.users.create({
        data: {
          email,
          passwordHash: hashedPassword,
          status: "ACTIVE",
          authProvider: "LOCAL",
          personaSelected: personaSelected ?? [],
          source,
          referralCode,
          inviteRequired: true,
        },
      });

      if (!newUser) throw new Error("Failed to create user.");

      // 3b. Create Default Profile
      const newProfile = await tx.profiles.create({
        data: {
          userId: newUser.id,
          username: usernameDesired,
          displayName: `${firstName} ${lastName}`,
          role: "TRAVELER",
        },
      });

      if (!newProfile) throw new Error("Failed to create default profile.");

      // 3c. Update User with defaultProfileId
      await tx.users.update({
        where: { id: newUser.id },
        data: { defaultProfileId: newProfile.id },
      });

      await streamServerClient.upsertUser({
        id: newProfile.id,
        username: usernameDesired,
        name: `${firstName} ${lastName}`,
      });
      return { userId: newUser.id, profileId: newProfile.id };
    });

    // 4️⃣ Return success
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
