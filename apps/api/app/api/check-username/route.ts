import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { status: 0, message: "Username is required" },
        { status: 400 }
      );
    }

    // Check if the username already exists in the users table
    const existingUser = await prisma.profiles.findFirst({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { status: 0, message: "This username is already in use" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { status: 1, message: "Username is available" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing username check:", error);
    return NextResponse.json(
      { status: 0, message: "Error processing username check" },
      { status: 500 }
    );
  }
}
