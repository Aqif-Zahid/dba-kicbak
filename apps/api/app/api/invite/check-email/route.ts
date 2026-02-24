import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success)
      return NextResponse.json(
        { status: 0, message: "Validation failed", errors: parsed.error.errors },
        { status: 400 }
      );

    const { email } = parsed.data;

    const user = await prisma.users.findUnique({
      where: { email },
      select: { id: true },
    });

    return NextResponse.json({ status: 1, data: { exists: !!user } });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
