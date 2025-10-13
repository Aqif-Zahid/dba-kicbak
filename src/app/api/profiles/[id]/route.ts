import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH: update profile
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { userId, displayName, bio, profilePicture } = body;
  const profileId = Number(params.id);

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    //  Ensure this profile belongs to the logged-in user
    const existingProfile = await prisma.profiles.findFirst({
      where: { id: profileId, userId: Number(userId) },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Profile not found or unauthorized" },
        { status: 404 }
      );
    }

    //  Update the profile
    const updatedProfile = await prisma.profiles.update({
      where: { id: profileId },
      data: {
        displayName: displayName ?? existingProfile.displayName,
        bio: bio ?? existingProfile.bio,
        profilePicture: profilePicture ?? existingProfile.profilePicture,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: delete profile (only if more than 1 exists)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { userId } = body;
  const profileId = Number(params.id);

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    //  Count total profiles for this user
    const profileCount = await prisma.profiles.count({
      where: { userId: Number(userId) },
    });

    if (profileCount <= 1) {
      return NextResponse.json(
        { error: "At least one profile must exist" },
        { status: 400 }
      );
    }

    //  Ensure this profile belongs to the user
    const existingProfile = await prisma.profiles.findFirst({
      where: { id: profileId, userId: Number(userId) },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Profile not found or unauthorized" },
        { status: 404 }
      );
    }

    //  Delete the profile
    await prisma.profiles.delete({
      where: { id: profileId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
