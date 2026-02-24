import prisma from "@/lib/prisma";
import { notifyChannel } from "@/lib/pg-listener";

/**
 * Background worker to automatically close expired polls.
 * Runs every 60 seconds using setInterval().
 */
let intervalStarted = false;

export function startPollExpirationWorker() {
  if (intervalStarted) return; // prevent multiple instances
  intervalStarted = true;

  console.log("[Poll Worker] Starting automatic poll expiration checker...");

  setInterval(async () => {
    try {
      const now = new Date();

      // Find expired, still-open polls
      const expiredPolls = await prisma.poll.findMany({
        where: {
          isClosed: false,
          expiresAt: { lt: now },
        },
        select: { id: true, postId: true },
      });

      if (expiredPolls.length > 0) {
        console.log(`[Poll Worker] Found ${expiredPolls.length} expired polls.`);

        // Mark them as closed and broadcast updates
        await prisma.poll.updateMany({
          where: { id: { in: expiredPolls.map((p) => p.id) } },
          data: { isClosed: true },
        });

        // Notify each one individually
        for (const poll of expiredPolls) {
          await notifyChannel("poll_updates", { pollId: poll.postId });
        }
      }
    } catch (err) {
      console.error("[Poll Worker] Error closing expired polls:", err);
    }
  }, 60 * 1000); // every 60 seconds
}
