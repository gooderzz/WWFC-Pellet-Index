import { timingSafeEqual } from "crypto";

/**
 * Two shared passphrases, no accounts — ADR 0005. Compared with a timing-safe
 * equality check on padded buffers so response time can't leak how many
 * characters matched.
 */

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  const length = Math.max(bufA.length, bufB.length, 1);
  const paddedA = Buffer.alloc(length);
  const paddedB = Buffer.alloc(length);
  bufA.copy(paddedA);
  bufB.copy(paddedB);
  const equalLength = bufA.length === bufB.length;
  const equalBytes = timingSafeEqual(paddedA, paddedB);
  return equalLength && equalBytes;
}

export function checkAdminPassphrase(candidate: string): boolean {
  const real = process.env.ADMIN_PASSPHRASE ?? "";
  if (!real) return false;
  return timingSafeStringEqual(candidate, real);
}

/** If VIEWER_PASSPHRASE is unset, the app is public and there is nothing to check. */
export function viewerPassphraseRequired(): boolean {
  return Boolean(process.env.VIEWER_PASSPHRASE);
}

export function checkViewerPassphrase(candidate: string): boolean {
  const real = process.env.VIEWER_PASSPHRASE ?? "";
  if (!real) return false;
  return timingSafeStringEqual(candidate, real);
}
