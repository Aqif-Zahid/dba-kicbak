import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { profiles, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getServerSession } from "next-auth"; // Assuming utility for server-side session

// === Zod validation ===
const profileCompletionSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
});

// === POST handler ===
export async function POST(req: Request) {
  // IMPORTANT: Securely retrieve the user session on the server
  // This ensures the request is authenticated and we know the userId
  const session = await getServerSession(/* authOptions or config */); 
  
  if (!session || !session.user?.id) {
    return NextResponse.json({ status: 0, message: "Not authenticated" }, { status: 401 });
  }

  const currentUserId = parseInt(session.user.id, 10);
  const body = await req.json();
  const parse = profileCompletionSchema.safeParse(body);

  if (!parse.success) {
    return NextResponse.json(
      { status: 0, message: "Validation error", errors: parse.error.flatten() },
      { status: 400 }
    );
  }

  const { firstName, lastName, username } = parse.data;

  try {
    // 1. Check if the authenticated user is actually PENDING
    const [userCheck] = await db
      .select({ status: users.status })
      .from(users)
      .where(eq(users.id, currentUserId));

    if (!userCheck || userCheck.status !== 'PENDING') {
        return NextResponse.json(
            { status: 0, message: "Account is already active or blocked." },
            { status: 403 }
        );
    }
    
    // 2. Check for unique username (must be unique across all profiles)
    const existingUsername = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.username, username));

    if (existingUsername.length > 0) {
      return NextResponse.json(
        { status: 0, message: "This username is already taken. Please choose another one." },
        { status: 409 }
      );
    }

    // 3. Perform the transaction (Create Profile, Update User Status/Link)
    const result = await db.transaction(async (tx) => {
      // 3a. Insert Default Profile
      const [insertedProfile] = await tx.insert(profiles).values({
        userId: currentUserId,
        username: username,
        displayName: `${firstName} ${lastName}`,
        role: "TRAVELER", // Default role for new users
      }).returning({ id: profiles.id });

      if (!insertedProfile) {
        throw new Error("Failed to create default profile.");
      }

      const newProfileId = insertedProfile.id;

      // 3b. Update User with defaultProfileId and set status to ACTIVE
      await tx.update(users)
        .set({
          defaultProfileId: newProfileId,
          status: "ACTIVE", // Activate the user
          updatedAt: sql.raw('now()'),
        })
        .where(eq(users.id, currentUserId));

      return { profileId: newProfileId };
    });

    // 4. Return success
    return NextResponse.json(
      {
        status: 1,
        message: "Profile completed and user activated successfully.",
        profileId: result.profileId,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Profile Completion Error:", err);
    return NextResponse.json(
      { status: 0, message: "Internal Server Error during profile completion." },
      { status: 500 }
    );
  }
}
