import { PrismaClient, TransactionType } from "@prisma/client";
const prisma = new PrismaClient();

export const runSeed = async () => {
  try {
    console.log("Seeding Treasury user, ledger entry, and reward settings...");

    const treasuryEmail = process.env.TREASURY_EMAIL;
    if (!treasuryEmail) {
      throw new Error("TREASURY_EMAIL environment variable is missing.");
    }

    // Ensure Treasury user exists
    const treasury = await prisma.users.upsert({
      where: { email: treasuryEmail },
      update: {},
      create: {
        email: treasuryEmail,
        status: "ACTIVE",
        points: 1_000_000,
        inviteRequired: false,
      },
    });

    // Ensure opening ledger entry exists for Treasury
    const existingEntry = await prisma.rewardsLedger.findFirst({
      where: { userId: treasury.id, reason: "MANUAL_ADJUST" },
    });

    if (!existingEntry) {
      await prisma.rewardsLedger.create({
        data: {
          userId: treasury.id,
          deltaPoints: 1_000_000,
          reason: "MANUAL_ADJUST",
          transactionType: TransactionType.DEBIT,
        },
      });
    }

    // Ensure default reward configuration entries exist
    const rewardSettings = [
      { key: "referrer_reward_points", value: "100" },
      { key: "referred_reward_points", value: "50" },
    ];

    for (const setting of rewardSettings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: {},
        create: {
          key: setting.key,
          value: setting.value,
        },
      });
    }

    console.log("Seed completed successfully.");
  } catch (error: any) {
    console.error("Seed error:", error?.message || error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

runSeed();
