export function generateEmailAlias(handle: string) {
  const domain = process.env.ALIAS_DOMAIN || "kicbak.co";

  // basic cleanup: lowercase + strip invalid chars
  const cleanedHandle = handle
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");

  return `${cleanedHandle}@${domain}`;
}
