export function generateEmailAlias(email: string) {
  const localPart = email.split("@")[0];
  return `${localPart.toLowerCase()}@${process.env.ALIAS_DOMAIN}`;
}
