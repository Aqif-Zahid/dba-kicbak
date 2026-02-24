import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

const RewardsSchema = z.object({
  referrer_reward_points: z
    .number()
    .int()
    .min(0, "Referrer reward points must be a non-negative number"),
  referred_reward_points: z
    .number()
    .int()
    .min(0, "Referred user reward points must be a non-negative number"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);

    const parsed = RewardsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { status: 0, message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { referrer_reward_points, referred_reward_points } = parsed.data;

    await prisma.$transaction([
      prisma.systemSettings.update({
        where: { key: "referrer_reward_points" },
        data: {
          value: String(referrer_reward_points),
          updatedAt: new Date(),
        },
      }),
      prisma.systemSettings.update({
        where: { key: "referred_reward_points" },
        data: {
          value: String(referred_reward_points),
          updatedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json(
      { status: 1, message: "Reward settings updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Configure Rewards Update Error:", error);
    return NextResponse.json(
      { status: 0, message: error?.message || "Failed to update reward settings" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { status: 0, message: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const settings = await prisma.systemSettings.findMany({
      where: {
        key: { in: ["referrer_reward_points", "referred_reward_points"] },
      },
      select: { key: true, value: true, updatedAt: true },
    });

    const referrerPoints = Number(
      settings.find((s) => s.key === "referrer_reward_points")?.value ?? 0
    );
    const referredPoints = Number(
      settings.find((s) => s.key === "referred_reward_points")?.value ?? 0
    );

    const lastUpdated =
      settings.reduce(
        (latest, s) => (s.updatedAt > latest ? s.updatedAt : latest),
        new Date(0)
      ) || null;

    return NextResponse.json(
      {
        status: 1,
        message: "OK",
        data: {
          referrerPoints,
          referredPoints,
          lastUpdated: lastUpdated ? lastUpdated.toISOString() : null,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Configure Rewards Fetch Error:", error);
    return NextResponse.json(
      { status: 0, message: error?.message || "Failed to load reward settings" },
      { status: 500 }
    );
  }
}
