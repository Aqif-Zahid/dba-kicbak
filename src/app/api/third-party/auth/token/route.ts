import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import apiClientAuth from "@/lib/api-client-auth";


const bodySchema = z.object({
  api_username: z.string().min(1, "api_username is required"),
  api_password: z.string().min(1, "api_password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { status: 0, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const client = await prisma.apiClient.findUnique({
      where: { username: parsed.data.api_username },
    });

    if (!client || !client.isActive) {
      return NextResponse.json({ status: 0, message: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(parsed.data.api_password, client.passwordHash);

    if (!valid) {
      return NextResponse.json({ status: 0, message: "Invalid credentials" }, { status: 401 });
    }

    const { token, expiresAt } = await apiClientAuth.signApiClientToken(client.id);

    return NextResponse.json(
      { status: 1, message: "Token generated successfully", token, expiresAt },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ status: 0, message: "Internal server error" }, { status: 500 });
  }
}
