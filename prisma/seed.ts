import { PrismaClient, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seeds the database with the Treasury user and its initial DEBIT ledger entry.
 */
export const runSeed = async () => {
  try {
    console.log("Seeding Treasury user and initial ledger entry...");

    // Ensure treasury user exists
    await prisma.users.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        email: "treasury@system.local",
        status: "ACTIVE",
        points: 1_000_000,
        inviteRequired: false,
      },
    });

    // 🧾 Ensure opening ledger entry exists
    const existingEntry = await prisma.rewardsLedger.findFirst({
      where: { userId: 1, reason: "MANUAL_ADJUST" },
    });

    if (!existingEntry) {
      await prisma.rewardsLedger.create({
        data: {
          userId: 1,
          deltaPoints: 1_000_000,
          reason: "MANUAL_ADJUST",
          transactionType: TransactionType.DEBIT,
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

// Run the seed when executed directly
runSeed();
