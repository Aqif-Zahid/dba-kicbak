import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { ProfileRole } from "@prisma/client";
import { z } from "zod";

const profileSchema = z.object({
  username: z
    .string()
    .min(4, "Invalid user name")
    .max(50, "Username can not be more than 50 characters"),
  displayName: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name can not be more than 50 characters"),
  bio: z
    .string()
    .max(255, "Bio can not be more than 255 characters")
    .optional(),
  role: z.string().optional(),
  profilePicture: z.string().optional(),
});

// === GET Profiles ===

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user)
    return NextResponse.json(
      { status: 0, message: "Unauthorized" },
      { status: 401 }
    );

  try {
    const profiles = await prisma.profiles.findMany({
      where: { userId: Number(user.id) },
      orderBy: { id: "asc" },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    // Move default profile to top
    const sortedProfiles = profiles.sort((a, b) => {
      if (a.id === Number(user.defaultProfileId)) return -1;
      if (b.id === Number(user.defaultProfileId)) return 1;
      return 0;
    });

    // Map response to include counts directly
    const responseData = sortedProfiles.map((profile) => ({
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      profilePicture: profile.profilePicture,
      bio: profile.bio,
      role: profile.role,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      totalPosts: profile._count.posts,
      totalFollowers: profile._count.followers,
      totalFollowing: profile._count.following,
    }));

    return NextResponse.json({ status: 1, data: responseData });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// === POST: Create Profile ===
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user)
    return NextResponse.json(
      { status: 0, message: "Unauthorized" },
      { status: 401 }
    );

  try {
    const body = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        {
          status: 0,
          message: "Validation failed",
          errors: parsed.error.errors,
        },
        { status: 400 }
      );

    const { username, displayName, role, profilePicture, bio } = parsed.data;

    const profileCount = await prisma.profiles.count({
      where: { userId: Number(user.id) },
    });
    if (profileCount >= 5)
      return NextResponse.json(
        { status: 0, message: "Profile limit reached" },
        { status: 400 }
      );

    const existingUsername = await prisma.profiles.findUnique({
      where: { username },
    });
    if (existingUsername)
      return NextResponse.json(
        { status: 0, message: "Username already taken" },
        { status: 409 }
      );

    const newProfile = await prisma.profiles.create({
      data: {
        userId: Number(user.id),
        username,
        displayName,
        role: (role as ProfileRole) || "TRAVELER",
        profilePicture,
        bio,
      },
    });

    return NextResponse.json({
      status: 1,
      message: "Profile created successfully",
      data: newProfile,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// === PATCH: Update Profile ===
export async function PATCH(req: NextRequest) {
  const user = await getUser(req);
  if (!user)
    return NextResponse.json(
      { status: 0, message: "Unauthorized" },
      { status: 401 }
    );

  try {
    const body = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        {
          status: 0,
          message: "Validation failed",
          errors: parsed.error.errors,
        },
        { status: 400 }
      );

    const { id, username, displayName, role, profilePicture, bio } = body;
    if (!id)
      return NextResponse.json(
        { status: 0, message: "Profile ID is required" },
        { status: 400 }
      );

    const existingProfile = await prisma.profiles.findUnique({
      where: { id: Number(id) },
    });
    if (!existingProfile || existingProfile.userId !== Number(user.id))
      return NextResponse.json(
        { status: 0, message: "Profile not found or access denied" },
        { status: 404 }
      );

    if (username) {
      const duplicate = await prisma.profiles.findFirst({
        where: { username, NOT: { id: Number(id) } },
      });
      if (duplicate)
        return NextResponse.json(
          { status: 0, message: "Username already taken" },
          { status: 409 }
        );
    }

    const updatedProfile = await prisma.profiles.update({
      where: { id: Number(id) },
      data: {
        username,
        displayName,
        role: (role as ProfileRole) || existingProfile.role,
        profilePicture,
        bio,
      },
    });

    return NextResponse.json({
      status: 1,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// === DELETE: Delete Profile by query param ?id=1 ===
export async function DELETE(req: NextRequest) {
  const user = await getUser(req);
  if (!user)
    return NextResponse.json(
      { status: 0, message: "Unauthorized" },
      { status: 401 }
    );

  const profileId = Number(req.nextUrl.searchParams.get("id"));
  if (!profileId)
    return NextResponse.json(
      { status: 0, message: "Profile ID is required" },
      { status: 400 }
    );

  try {
    const profileCount = await prisma.profiles.count({
      where: { userId: Number(user.id) },
    });
    if (profileCount <= 1)
      return NextResponse.json(
        { status: 0, message: "At least one profile must exist" },
        { status: 400 }
      );

    const existingProfile = await prisma.profiles.findFirst({
      where: { id: profileId, userId: Number(user.id) },
    });
    if (!existingProfile)
      return NextResponse.json(
        { status: 0, message: "Profile not found or unauthorized" },
        { status: 404 }
      );

    await prisma.profiles.delete({ where: { id: profileId } });

    // Reassign default profile if needed
    if (Number(user.defaultProfileId) === profileId) {
      const newDefault = await prisma.profiles.findFirst({
        where: { userId: Number(user.id) },
        orderBy: { id: "asc" },
      });
      if (newDefault)
        await prisma.users.update({
          where: { id: Number(user.id) },
          data: { defaultProfileId: newDefault.id },
        });
    }

    return NextResponse.json({
      status: 1,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
