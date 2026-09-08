"use server";

import {
  checkAdminPassphrase,
  checkViewerPassphrase,
  viewerPassphraseRequired,
} from "@/lib/auth/passphrases";
import { clearAdminCookie, setAdminCookie, setViewerCookie } from "@/lib/auth/session";

export type UnlockResult = { ok: true } | { ok: false; error: string };

export async function unlockAdmin(passphrase: string): Promise<UnlockResult> {
  if (!checkAdminPassphrase(passphrase)) {
    return { ok: false, error: "That's not the admin passphrase. Try again." };
  }
  await setAdminCookie();
  return { ok: true };
}

export async function unlockViewer(passphrase: string): Promise<UnlockResult> {
  if (!viewerPassphraseRequired()) {
    return { ok: true };
  }
  if (!checkViewerPassphrase(passphrase)) {
    return { ok: false, error: "That's not the viewer passphrase. Try again." };
  }
  await setViewerCookie();
  return { ok: true };
}

export async function lockAdmin(): Promise<void> {
  await clearAdminCookie();
}
