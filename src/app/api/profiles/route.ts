import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// === GET all profiles for a specific user ===
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userIdParam = searchParams.get("userId");

  if (!userIdParam) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const userId = Number(userIdParam);

  try {
    // 1 Get the user's defaultProfileId
    const userRecord = await prisma.users.findUnique({
      where: { id: userId },
      select: { defaultProfileId: true },
    });

    // 2 Fetch all profiles for the user
    const allProfiles = await prisma.profiles.findMany({
      where: { userId },
      orderBy: { id: "asc" },
    });

    // 3 Return profiles + defaultProfileId
    return NextResponse.json({
      profiles: allProfiles,
      defaultProfileId: userRecord?.defaultProfileId || null,
    });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// === POST new profile for a specific user ===
export async function POST(req: Request) {
  const body = await req.json();
  const { userId, username, displayName, role } = body;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    // 1 Check if the user already has 5 profiles
    const profileCount = await prisma.profiles.count({
      where: { userId: Number(userId) },
    });

    if (profileCount >= 5) {
      return NextResponse.json(
        { error: "Profile limit reached" },
        { status: 400 }
      );
    }

    // 2 Check for duplicate username globally
    const existingUsername = await prisma.profiles.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "This username is already taken. Please choose another one." },
        { status: 409 }
      );
    }

    // 3 Create the new profile
    const newProfile = await prisma.profiles.create({
      data: {
        userId: Number(userId),
        username,
        displayName,
        role: role?.toUpperCase() || "TRAVELER",
      },
    });

    return NextResponse.json(newProfile);
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
