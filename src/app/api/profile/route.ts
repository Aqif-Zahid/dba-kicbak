import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma"; // Prisma client
import { getServerSession } from "next-auth";
import { getCurrentUserId } from "@/helpers/get-current-user-id";
import { Prisma } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/route";

// === Zod validation ===
const profileCompletionSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
});

// === POST handler ===
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = getCurrentUserId(session);
  if (!session || !session.user || !currentUserId) {
    return NextResponse.json(
      { status: 0, message: "Not authenticated" },
      { status: 401 }
    );
  }
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
    // 1️⃣ Check if the user exists and is PENDING
    const user = await prisma.users.findUnique({
      where: { id: currentUserId },
    });

    if (!user || user.status !== "PENDING") {
      return NextResponse.json(
        { status: 0, message: "Account is already active or blocked." },
        { status: 403 }
      );
    }

    // 2️⃣ Check for unique username
    const existingUsername = await prisma.profiles.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        {
          status: 0,
          message: "This username is already taken. Please choose another one.",
        },
        { status: 409 }
      );
    }

    // 3️⃣ Transaction: Create profile + update user
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const insertedProfile = await tx.profiles.create({
          data: {
            userId: currentUserId,
            username,
            displayName: `${firstName} ${lastName}`,
            role: "TRAVELER", // Default role
          },
        });

        await tx.users.update({
          where: { id: currentUserId },
          data: {
            defaultProfileId: insertedProfile.id,
            status: "ACTIVE",
          },
        });

        return insertedProfile;
      }
    );

    // 4️⃣ Return success
    return NextResponse.json(
      {
        status: 1,
        message: "Profile completed and user activated successfully.",
        profileId: result.id,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Profile Completion Error:", err);
    return NextResponse.json(
      {
        status: 0,
        message: "Internal Server Error during profile completion.",
      },
      { status: 500 }
    );
  }
}
