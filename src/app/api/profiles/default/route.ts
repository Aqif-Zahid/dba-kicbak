import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  const body = await req.json();
  const { userId, profileId } = body;

  if (!userId || !profileId) {
    return NextResponse.json(
      { error: "Missing userId or profileId" },
      { status: 400 }
    );
  }

  try {
    // 1️⃣ Verify that the profile actually belongs to the user
    const profileExists = await prisma.profiles.findFirst({
      where: { id: Number(profileId), userId: Number(userId) },
    });

    if (!profileExists) {
      return NextResponse.json(
        { error: "Profile not found or unauthorized" },
        { status: 404 }
      );
    }

    // 2️⃣ Update the user's default profile ID
    await prisma.users.update({
      where: { id: Number(userId) },
      data: { defaultProfileId: Number(profileId) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting default profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
