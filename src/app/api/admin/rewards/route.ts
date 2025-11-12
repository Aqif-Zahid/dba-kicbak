import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  referrer_reward_points: z.number().int().min(0),
  referred_reward_points: z.number().int().min(0),
});

// =======================
// GET: fetch current reward settings
// =======================
export async function GET(req: Request) {
  try {
    const user = await getUser(req as any);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const settings = await prisma.systemSettings.findMany({
      where: {
        key: { in: ["referrer_reward_points", "referred_reward_points"] },
      },
    });

    const data: Record<string, any> = {};
    settings.forEach((s) => (data[s.key] = Number(s.value)));

    const lastUpdated =
      settings.reduce(
        (latest, s) =>
          s.updatedAt > latest ? s.updatedAt : latest,
        new Date(0)
      ) || null;

    return NextResponse.json({
      status: 1,
      message: "Reward settings fetched successfully",
      data: { ...data, lastUpdated },
    });
  } catch (error: any) {
    console.error("GET /rewards error:", error);
    return NextResponse.json(
      { status: 0, message: error?.message || "Failed to fetch reward settings" },
      { status: 500 }
    );
  }
}

// =======================
// POST: update reward settings
// =======================
export async function POST(req: Request) {
  try {
    const user = await getUser(req as any);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { status: 0, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { referrer_reward_points, referred_reward_points } = parsed.data;

    await prisma.$transaction([
      prisma.systemSettings.update({
        where: { key: "referrer_reward_points" },
        data: { value: String(referrer_reward_points), updatedAt: new Date() },
      }),
      prisma.systemSettings.update({
        where: { key: "referred_reward_points" },
        data: { value: String(referred_reward_points), updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      status: 1,
      message: "Reward settings updated successfully",
    });
  } catch (error: any) {
    console.error("POST /rewards error:", error);
    return NextResponse.json(
      { status: 0, message: error?.message || "Failed to update reward settings" },
      { status: 500 }
    );
  }
}
