import type { NextRequest } from "next/server";

export type SiteVariant = "KICBAK" | "DBA";

function normalizeHost(host: string | null): string {
  if (!host) return "";
  return host.toLowerCase().split(":")[0];
}

export function getSiteVariant(req?: NextRequest): SiteVariant {
  // 1) Prefer host-based switching (production / real domains)
  const host = req ? normalizeHost(req.headers.get("host")) : "";

  // TODO: replace these with real domains later
  const DBA_HOSTS = new Set(["dba.localhost", "dba.com", "www.dba.com"]);
  const KICBAK_HOSTS = new Set(["kicbak.localhost", "kicbak.com", "www.kicbak.com"]);

  if (DBA_HOSTS.has(host)) return "DBA";
  if (KICBAK_HOSTS.has(host)) return "KICBAK";

  // 2) Fallback to env for local testing / preview
  const raw = (process.env.SITE_VARIANT ?? "KICBAK").toUpperCase();
  return raw === "DBA" ? "DBA" : "KICBAK";
}
