import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateEmailAlias } from "@/lib/email-alias";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const user = await getUser(req);
    if (!user) {
      return NextResponse.json(
        { status: 0, message: "User unauthorized" },
        { status: 401 }
      );
    }

    const userId = Number(user.id);
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { status: 0, message: "Invalid user id" },
        { status: 500 }
      );
    }

    // Prevent overwriting existing alias
    const currentUser = await prisma.users.findUnique({
      where: { id: userId },
      select: { emailAlias: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { status: 0, message: "User not found" },
        { status: 404 }
      );
    }

    if (currentUser.emailAlias) {
      return NextResponse.json(
        { status: 0, message: "Email alias already exists" },
        { status: 409 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { requestedHandle } = body;

    if (!requestedHandle || typeof requestedHandle !== "string") {
      return NextResponse.json(
        { status: 0, message: "Alias handle is required" },
        { status: 400 }
      );
    }

    const trimmed = requestedHandle.trim();

    // Enforce minimum length of 5 characters
    if (trimmed.length < 5) {
      return NextResponse.json(
        {
          status: 0,
          message: "Alias handle must be at least 5 characters long",
        },
        { status: 400 }
      );
    }

    // Enforce maximum length of 15 characters
    if (trimmed.length > 15) {
      return NextResponse.json(
        {
          status: 0,
          message: "Alias handle cannot exceed 15 characters",
        },
        { status: 400 }
      );
    }

    // Enforce allowed characters: a-z, 0-9, dot, underscore, hyphen
    const allowedPattern = /^[a-z0-9._-]+$/;
    if (!allowedPattern.test(trimmed.toLowerCase())) {
      return NextResponse.json(
        {
          status: 0,
          message:
            "Alias handle can only contain lowercase letters, numbers, dots (.), underscores (_) and hyphens (-)",
        },
        { status: 400 }
      );
    }

    // Normalize and generate alias
    const alias = generateEmailAlias(trimmed);

    // Check if alias already exists for any user
    const existing = await prisma.users.findFirst({
      where: { emailAlias: alias },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { status: 0, message: "Alias is already taken" },
        { status: 409 }
      );
    }

    // Save alias to user's account
    await prisma.users.update({
      where: { id: userId },
      data: { emailAlias: alias },
    });

    // Return success
    return NextResponse.json(
      {
        status: 1,
        message: "Alias successfully created",
        alias,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Alias generation error:", error);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
