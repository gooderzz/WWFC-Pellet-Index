/**
 * The standard head of every screen, and the default home for yellow.
 * See DESIGN.md §Page Title.
 */
export function PageTitle({
  eyebrow,
  title,
}: {
  eyebrow?: string;
  title: string;
}) {
  return (
    <div>
      {eyebrow ? (
        <p className="mb-2 text-[12px] leading-[1.2] font-semibold uppercase tracking-[0.08em] text-ink-muted">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-balance font-display font-extrabold text-[32px] leading-[1] tracking-[-0.02em] md:text-[56px]">
        {title}
      </h1>
      <div className="mt-2 h-2 w-16 bg-yellow" />
    </div>
  );
}
