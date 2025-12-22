import type { NextRequest } from "next/server";
import { decode, encode } from "next-auth/jwt";

const API_CLIENT_SECRET = process.env.THIRD_PARTY_API_TOKEN_SECRET;

type ApiClientTokenPayload = {
  type: "API_CLIENT";
  clientId: number;
};

async function signApiClientToken(clientId: number) {
  if (!API_CLIENT_SECRET) {
    throw new Error("THIRD_PARTY_API_TOKEN_SECRET is not set");
  }

  const maxAge = 60 * 60 * 24; // 24 hours

  const token = await encode({
    token: { type: "API_CLIENT", clientId } as ApiClientTokenPayload,
    secret: API_CLIENT_SECRET,
    maxAge,
  });

  return {
    token,
    expiresAt: new Date(Date.now() + maxAge * 1000).toISOString(),
  };
}

async function getApiClientFromRequest(req: NextRequest) {
  if (!API_CLIENT_SECRET) {
    return null;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;

  const decoded = (await decode({
    token,
    secret: API_CLIENT_SECRET,
  })) as ApiClientTokenPayload | null;

  if (!decoded || decoded.type !== "API_CLIENT") {
    return null;
  }

  return { clientId: decoded.clientId };
}

const apiClientAuth = {
  signApiClientToken,
  getApiClientFromRequest,
};

export default apiClientAuth;
