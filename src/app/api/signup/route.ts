import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { profiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

// === Zod validation ===
const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email(),
  usernameDesired: z.string().min(3).max(20),
  personaSelected: z.array(z.string()).optional(),
  referralCode: z.string(),
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
    // 1. Find the existing user by email
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!existingUser) {
      return NextResponse.json({
        status: 0,
        message: "You haven't got any referral code yet",
      });
    }

    // 2. Validate referral code
    const referralUser = await db.query.users.findFirst({
      where: eq(users.username, referralCode),
    });
    if (!referralUser) {
      return NextResponse.json(
        { status: 0, message: "Invalid or inactive referral code" },
        { status: 400 }
      );
    }

    // 3. Compute the latest positionNumber
    //  Find the latest user with a positionNumber not null
    const latestUser = await db.query.users.findFirst({
      where: sql`${users.positionNumber} IS NOT NULL`,
      orderBy: (u) => sql`CAST(${u.positionNumber} AS INT) DESC`,
    });

    const positionNumber = latestUser
      ? Number(latestUser.positionNumber) + 1
      : 1001; // start at 1001 if no users have positionNumber

    // 4. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 5. Update existing user (do NOT insert a new one)
    await db
      .update(users)
      .set({
        positionNumber,
        displayName: `${firstName} ${lastName}`,
        usernameDesired,
        username: usernameDesired,
        personaSelected,
        passwordHash,
        source,
        inviteRequired: true,
        status: "ACTIVE",
        role: "TRAVELER",
        updatedAt: new Date(),
      })
      .where(eq(users.email, email));

    // 6. Insert default profile
    await db.insert(profiles).values({
      userId: existingUser.id,
      role: "TRAVELER",
      profileName: `${firstName} ${lastName}`,
      bio: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 7. Return success
    return NextResponse.json(
      {
        status: 1,
        message: "Signed up successfully",
      },
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
