import type { ReactNode } from "react";

type Tone = "paper" | "yellow" | "navy" | "black";

const TONE_CLASSES: Record<Tone, string> = {
  paper: "bg-paper text-ink",
  yellow: "bg-yellow text-navy",
  navy: "bg-navy text-paper",
  black: "bg-black text-paper",
};

/**
 * Full-bleed page region — the enforcement point for the colour budget.
 * At most one non-paper band per page. Yellow is capped at 160px mobile /
 * 200px desktop. See DESIGN.md §Section Band.
 */
export function SectionBand({
  tone = "paper",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  const heightCap = tone === "yellow" ? "max-h-40 md:max-h-[200px]" : "";
  return (
    <section
      className={`w-full ${TONE_CLASSES[tone]} ${heightCap} py-12 md:py-16 ${className}`}
    >
      <div className="mx-auto max-w-[1120px] px-4 md:px-8">{children}</div>
    </section>
  );
}
