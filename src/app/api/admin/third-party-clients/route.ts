import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const bodySchema = z.object({
  userId: z.number().int().positive(),
  name: z.string().min(1, "name is required"),
});

function randomKey(bytes = 24) {
  // URL-safe-ish token
  return crypto.randomBytes(bytes).toString("base64url");
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req as any);

    if (!user) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: No active session" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { status: 0, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { userId, name } = parsed.data;

    const targetUser = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { status: 0, message: "User not found" },
        { status: 404 }
      );
    }

    const clientKey = `tpc_${randomKey(18)}`;
    const clientSecret = `tps_${randomKey(32)}`;
    const clientSecretHash = await bcrypt.hash(clientSecret, 10);

    const created = await prisma.thirdPartyClient.create({
      data: {
        userId,
        name,
        clientKey,
        clientSecretHash,
      },
    });

    // Important: return the RAW secret only once (admin will copy it)
    return NextResponse.json(
      {
        status: 1,
        message: "Third party client created successfully",
        data: {
          id: created.id,
          userId: created.userId,
          name: created.name,
          clientKey: created.clientKey,
          clientSecret,
          isActive: created.isActive,
          createdAt: created.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error creating third party client:", error);
    return NextResponse.json(
      { status: 0, message: "Error creating third party client" },
      { status: 500 }
    );
  }
}
