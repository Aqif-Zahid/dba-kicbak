import crypto from "crypto";

const IV_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const secret = process.env.USER_COOKIE_SECRET;
  if (!secret) {
    // During build, we just return a dummy key to prevent crash, can remove before/during/after deployment
    return Buffer.alloc(32); // 32-byte zero buffer for build safety
  }

  try {
    const buf = Buffer.from(secret, "hex");
    if (buf.length !== 32) {
      console.warn(
        `⚠️ USER_COOKIE_SECRET must be 32 bytes (64 hex chars), got ${buf.length}`
      );
    }
    return buf;
  } catch (err) {
    console.error("Invalid USER_COOKIE_SECRET format:", err);
    return Buffer.alloc(32); // fallback for safety
  }
}

export function encryptCookie(data: any): string {
  const ENCRYPTION_KEY = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf8"),
    cipher.final(),
  ]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decryptCookie(cookie: string): any {
  const ENCRYPTION_KEY = getEncryptionKey();
  const [ivHex, encryptedHex] = cookie.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString("utf8"));
}
