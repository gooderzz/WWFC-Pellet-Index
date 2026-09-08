"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { lockAdmin, unlockAdmin } from "@/lib/actions/unlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusChip } from "@/components/pellet/StatusChip";

/**
 * The role chip plus its unlock flow — the one thing on this screen that
 * actually proves the passphrase auth (ADR 0005) is wired end to end, not
 * just the deploy pipeline.
 */
export function RoleStatus({ role }: { role: "Admin" | "Viewer" }) {
  const router = useRouter();
  const [showUnlock, setShowUnlock] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUnlock(formData: FormData) {
    const value = String(formData.get("passphrase") ?? "");
    setError(null);
    startTransition(async () => {
      const result = await unlockAdmin(value);
      if (result.ok) {
        setShowUnlock(false);
        setPassphrase("");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleLock() {
    startTransition(async () => {
      await lockAdmin();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
          Signed in as
        </span>
        <StatusChip tone={role === "Admin" ? "admin" : "default"}>{role}</StatusChip>
        {role === "Admin" ? (
          <Button variant="secondary" onClick={handleLock} disabled={isPending}>
            Lock
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => setShowUnlock((open) => !open)}
            disabled={isPending}
          >
            Unlock admin
          </Button>
        )}
      </div>

      {showUnlock ? (
        <form
          action={handleUnlock}
          className="flex flex-col gap-3 border-l-2 border-navy py-1 pl-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="passphrase"
              className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted"
            >
              Admin passphrase
            </label>
            <Input
              id="passphrase"
              name="passphrase"
              type="password"
              autoComplete="off"
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
              placeholder="Ask Shane, Tom or William"
            />
          </div>
          <Button type="submit" disabled={isPending || !passphrase}>
            {isPending ? "Checking…" : "Unlock"}
          </Button>
        </form>
      ) : null}

      {error ? <p className="text-[14px] text-loss">{error}</p> : null}
    </div>
  );
}
