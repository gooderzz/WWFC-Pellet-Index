import { createHmac } from "crypto";
import { cookies } from "next/headers";

/**
 * Signed, httpOnly session cookies — ADR 0005. No `users` table: a cookie
 * value is just the role ("admin" | "viewer") plus an HMAC signature keyed
 * on SESSION_SECRET, so a cookie minted on one environment's secret can't
 * unlock another.
 */

const ADMIN_COOKIE = "ww_admin";
const VIEWER_COOKIE = "ww_viewer";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

type Role = "admin" | "viewer";

function sign(value: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function makeCookieValue(role: Role): string {
  return `${role}.${sign(role)}`;
}

function verifyCookieValue(value: string | undefined, role: Role): boolean {
  if (!value) return false;
  const [payload, signature] = value.split(".");
  if (payload !== role || !signature) return false;
  return signature === sign(role);
}

function isSecureContext(): boolean {
  // Vercel sets VERCEL=1 in every deployment; localhost never does.
  return process.env.VERCEL === "1" || process.env.WW_ENV !== "local";
}

export async function setAdminCookie() {
  const store = await cookies();
  store.set(ADMIN_COOKIE, makeCookieValue("admin"), {
    httpOnly: true,
    secure: isSecureContext(),
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function setViewerCookie() {
  const store = await cookies();
  store.set(VIEWER_COOKIE, makeCookieValue("viewer"), {
    httpOnly: true,
    secure: isSecureContext(),
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function getAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifyCookieValue(store.get(ADMIN_COOKIE)?.value, "admin");
}

export async function getViewer(): Promise<boolean> {
  const store = await cookies();
  return verifyCookieValue(store.get(VIEWER_COOKIE)?.value, "viewer");
}

/** The role to show on screen: Admin beats Viewer beats Player/Viewer (public). */
export async function getRole(): Promise<"Admin" | "Viewer"> {
  const admin = await getAdmin();
  return admin ? "Admin" : "Viewer";
}
