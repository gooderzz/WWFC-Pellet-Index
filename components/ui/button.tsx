import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

const BASE =
  "inline-flex min-h-[48px] items-center justify-center rounded-full px-7 py-3.5 font-text text-[16px] font-semibold transition-[transform,background-color] duration-[120ms] ease-out active:translate-y-px focus-visible:outline focus-visible:outline-3 focus-visible:outline-navy focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-navy text-paper hover:bg-navy-700",
  secondary: "bg-paper text-navy outline outline-1 outline-navy hover:bg-chalk",
};

/**
 * Primary/secondary button per DESIGN.md — radius-action pill, no border,
 * no shadow. See component-system.md §Layer 2.
 */
export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button className={`${BASE} ${VARIANT_CLASSES[variant]} ${className}`} {...props} />
  );
}
