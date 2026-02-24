import type { NextRequest } from "next/server";
import { decode, encode } from "next-auth/jwt";

const API_CLIENT_SECRET = process.env.THIRD_PARTY_API_TOKEN_SECRET;

type ThirdPartyClientTokenPayload = {
  type: "THIRD_PARTY_CLIENT";
  thirdPartyClientId: number;
};

async function signThirdPartyClientToken(thirdPartyClientId: number) {
  if (!API_CLIENT_SECRET) {
    throw new Error("THIRD_PARTY_API_TOKEN_SECRET is not set");
  }

  const maxAge = 60 * 60 * 24; // 24 hours

  const token = await encode({
    token: {
      type: "THIRD_PARTY_CLIENT",
      thirdPartyClientId,
    } as ThirdPartyClientTokenPayload,
    secret: API_CLIENT_SECRET,
    maxAge,
  });

  return {
    token,
    expiresAt: new Date(Date.now() + maxAge * 1000).toISOString(),
  };
}

async function getThirdPartyClientFromRequest(req: NextRequest) {
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
  })) as ThirdPartyClientTokenPayload | null;

  if (!decoded || decoded.type !== "THIRD_PARTY_CLIENT") {
    return null;
  }

  return { thirdPartyClientId: decoded.thirdPartyClientId };
}

const thirdPartyClientAuth = {
  signThirdPartyClientToken,
  getThirdPartyClientFromRequest,
};

export default thirdPartyClientAuth;
