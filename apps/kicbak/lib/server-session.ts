import { headers } from "next/headers";

export type ApiSession = { user?: any; expires?: string } | null;

/**
 * Prefer calling the frontend origin so Next rewrites can proxy /api/* to apps/api.
 * This avoids port mismatches and keeps cookie behavior consistent.
 */
export const getApiBaseUrl = () => {
  const explicit = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (explicit) return explicit;

  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";

  return `${proto}://${host}`;
};

export const getServerSessionFromApi = async (): Promise<ApiSession> => {
  const cookie = headers().get("cookie") ?? "";

  const res = await fetch(`${getApiBaseUrl()}/api/auth/session`, {
    headers: { cookie },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return (await res.json()) as ApiSession;
};
