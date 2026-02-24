export function generateEmailAlias(handle: string) {
  const domain = process.env.ALIAS_DOMAIN || "kicbak.co";

  const cleanedHandle = handle
    .trim()
    .toLowerCase()
  return `${cleanedHandle}@${domain}`;
}
