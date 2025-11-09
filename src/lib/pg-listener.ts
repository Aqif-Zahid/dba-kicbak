import { Client } from "pg";
import { startPollExpirationWorker } from "@/lib/poll-expiration-worker"; // ✅ added import

const connectionString = process.env.DATABASE_URL!;
const client = new Client({ connectionString });

client.connect();

// Keep one global listener
client.on("error", (err) => console.error("PG listener error:", err));

// Subscribe to Postgres channel
export const listenToChannel = async (
  channel: string,
  callback: (payload: any) => void
) => {
  await client.query(`LISTEN ${channel}`);
  client.on("notification", (msg) => {
    if (msg.channel === channel) {
      try {
        callback(JSON.parse(msg.payload || "{}"));
      } catch {
        console.error("Failed to parse payload:", msg.payload);
      }
    }
  });
};

// Emit an event
export const notifyChannel = async (channel: string, payload: any) => {
  await client.query(`NOTIFY ${channel}, '${JSON.stringify(payload)}'`);
};

// ✅ Start background poll expiration worker once at startup
startPollExpirationWorker();
