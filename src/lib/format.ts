/**
 * Split a claim value like "0.15ms", "78.17%", "500+", "8/8" into a
 * countable leading number and its surrounding text, so <Claim> can
 * tick the number while keeping units static.
 * Returns null when the value has no leading number (e.g. "PASS").
 */
export function splitClaimValue(
  value: string,
): { prefix: string; num: number; decimals: number; suffix: string } | null {
  const match = /^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/.exec(value);
  if (!match) return null;
  const [, prefix = "", numRaw = "", suffix = ""] = match;
  const decimals = numRaw.includes(".") ? numRaw.split(".")[1]!.length : 0;
  return { prefix, num: Number.parseFloat(numRaw), decimals, suffix };
}

export function formatCount(n: number, decimals: number): string {
  return n.toFixed(decimals);
}
