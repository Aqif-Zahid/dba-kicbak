import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { status: 0, message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if the email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          status: 0,
          message: "This email is already registered or has a pending request.",
        },
        { status: 200 }
      );
    }

    // Create user with profile inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Create the user
      const user = await tx.users.create({
        data: {
          email,
          status: "PENDING",
        },
      });

      // 2️⃣ Create the default profile
      const profile = await tx.profiles.create({
        data: {
          role: "TRAVELER",
          displayName: email.split("@")[0],
          username: email.split("@")[0],
          user: { connect: { id: user.id } },
        },
      });

      // 3️⃣ Update user.defaultProfileId
      const updatedUser = await tx.users.update({
        where: { id: user.id },
        data: { defaultProfileId: profile.id },
      });

      return { user: updatedUser, profile };
    });

    return NextResponse.json(
      {
        status: 1,
        message: "Invite request submitted successfully",
        user: result.user,
        profile: result.profile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing invite request:", error);
    return NextResponse.json(
      { status: 0, message: "Error processing invite request" },
      { status: 500 }
    );
  }
}
