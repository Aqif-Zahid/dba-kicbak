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
    // 1️⃣ Create the user
    const user = await prisma.users.create({
      data: {
        email,
        status: "PENDING",
      },
    });
    return NextResponse.json(
      {
        status: 1,
        message: "Invite request submitted successfully",
        user: user,
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
