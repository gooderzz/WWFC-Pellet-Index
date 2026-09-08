import type { InputHTMLAttributes } from "react";

/**
 * Text input per DESIGN.md — not a box. 1px navy bottom border, radius-surface
 * (0), 48px tall, 16px text (never smaller, or iOS zooms on focus).
 */
export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-12 w-full rounded-none border-0 border-b border-navy bg-transparent px-0 font-text text-[16px] text-ink outline-none placeholder:text-ink-muted focus:border-b-2 focus-visible:outline focus-visible:outline-3 focus-visible:outline-navy focus-visible:outline-offset-2 ${className}`}
      {...props}
    />
  );
}
