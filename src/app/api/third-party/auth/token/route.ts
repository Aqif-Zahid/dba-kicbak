import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import thirdPartyClientAuth from "@/lib/api-client-auth";
import bcrypt from "bcryptjs";

const bodySchema = z.object({
  client_key: z.string().min(1, "client_key is required"),
  client_secret: z.string().min(1, "client_secret is required"),
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

    const { client_key, client_secret } = parsed.data;

    const client = await prisma.thirdPartyClient.findUnique({
      where: { clientKey: client_key },
    });

    if (!client || !client.isActive) {
      return NextResponse.json(
        { status: 0, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(client_secret, client.clientSecretHash);

    if (!valid) {
      return NextResponse.json(
        { status: 0, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const { token, expiresAt } = await thirdPartyClientAuth.signThirdPartyClientToken(client.id);


    return NextResponse.json(
      {
        status: 1,
        message: "Token generated successfully",
        token,
        expiresAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Third party token error:", error);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
