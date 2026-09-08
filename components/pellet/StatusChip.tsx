/**
 * DESIGN.md §Status Chip — radius-stamp (2px), 12px/600 uppercase, +0.08em.
 * Reused here to show the current role, since a role is a record of who is
 * looking, not an action.
 */
export function StatusChip({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "admin";
}) {
  return (
    <span
      className={`inline-flex items-center rounded-[2px] px-2 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] ${
        tone === "admin" ? "bg-navy text-paper" : "bg-chalk text-navy"
      }`}
    >
      {children}
    </span>
  );
}
