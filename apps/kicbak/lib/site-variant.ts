import { headers } from "next/headers";

export type SiteVariant = "kicbak" | "dba";

/**
 * Determines which site variant is being served based on Host header.
 * You can override the decision with SITE_VARIANT env if needed.
 */
export const getSiteVariant = (): SiteVariant => {
  const forced = process.env.SITE_VARIANT;
  if (forced === "dba" || forced === "kicbak") return forced;

  const host = headers().get("host")?.toLowerCase() ?? "";

  // You can tune these rules later. Keep it simple for now.
  if (host.includes("dba")) return "dba";

  return "kicbak";
};
