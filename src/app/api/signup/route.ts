import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { profiles, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
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
    password,
    usernameDesired,
    personaSelected,
    referralCode,
    source,
  } = parse.data;

  try {
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      return NextResponse.json(
        { status: 0, message: "A user with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Scenario 1: User signed up with an invite code -> ACTIVE + Default Profile
    const result = await db.transaction(async (tx) => {
      // 1. Insert User with ACTIVE status
      const [insertedUser] = await tx.insert(users).values({
        email,
        passwordHash: hashedPassword,
        status: "ACTIVE", 
        provider: "LOCAL",
        usernameDesired,
        personaSelected,
        source,
        referralCode,
        inviteRequired: true,
      }).returning({ id: users.id });

      if (!insertedUser) {
        throw new Error("Failed to create user.");
      }
      
      const newUserId = insertedUser.id;

      // 2. Insert Default Profile
      const [insertedProfile] = await tx.insert(profiles).values({
        userId: newUserId,
        username: usernameDesired, 
        displayName: `${firstName} ${lastName}`,
        role: "TRAVELER",
      }).returning({ id: profiles.id });

      if (!insertedProfile) {
        throw new Error("Failed to create default profile.");
      }

      const newProfileId = insertedProfile.id;

      // 3. Update User with defaultProfileId
      await tx.update(users)
        .set({
          defaultProfileId: newProfileId,
          updatedAt: sql.raw('now()'),
        })
        .where(eq(users.id, newUserId));

      return { userId: newUserId, profileId: newProfileId };
    });

    // 4. Return success
    return NextResponse.json(
      {
        status: 1,
        message: "Signed up successfully",
        userId: result.userId,
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
  