import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const SECRET = process.env.NEXTAUTH_SECRET!;

export async function getUser(req: NextRequest) {
  if (!SECRET) {
    throw new Error("NEXTAUTH_SECRET environment variable is not set.");
  }

  const token = await getToken({ req, secret: SECRET });
  return token;
}
