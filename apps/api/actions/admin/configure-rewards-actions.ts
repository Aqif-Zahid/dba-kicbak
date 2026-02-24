"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// =======================
// Validation Schema
// =======================
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

// =======================
// Server Action
// =======================
export async function updateRewardSettings(values: {
  referrer_reward_points: number;
  referred_reward_points: number;
}) {
  try {
    // -----------------------
    // Authenticate user
    // -----------------------
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return {
        status: 0,
        message: "Unauthorized: Admin access required",
      };
    }

    // -----------------------
    // Validate input
    // -----------------------
    const parsed = RewardsSchema.safeParse(values);
    if (!parsed.success) {
      return {
        status: 0,
        message: parsed.error.errors[0].message,
      };
    }

    const { referrer_reward_points, referred_reward_points } = parsed.data;

    // -----------------------
    // Update database
    // -----------------------
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

    return {
      status: 1,
      message: "Reward settings updated successfully",
    };
  } catch (error: any) {
    console.error("Configure Rewards Update Error:", error);
    return {
      status: 0,
      message: error?.message || "Failed to update reward settings",
    };
  }
}
