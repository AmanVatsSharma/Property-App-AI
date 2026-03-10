/**
 * @file Button.tsx
 * @module ui
 * @description Primary button primitive; maps variants to design tokens
 * @author BharatERP
 * @created 2025-03-10
 */

import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost-sm";
  size?: "default" | "lg";
  "data-testid"?: string;
}

export function Button({
  variant = "primary",
  size = "default",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const base = "font-inherit cursor-pointer transition-all duration-200 rounded-[100px] border";
  const variants = {
    primary: "border-none bg-[linear-gradient(135deg,var(--teal),#00c49a)] text-[var(--night)] font-bold text-sm shadow-[0_4px_20px_var(--teal-glow)] hover:translate-y-[-2px] hover:shadow-[0_8px_32px_var(--teal-glow)] px-7 py-3",
    outline: "border-[1.5px] border-[var(--glass-border)] bg-transparent font-semibold text-sm text-[var(--text)] hover:border-[var(--teal)] hover:text-[var(--teal)] hover:bg-[var(--teal-dim)] px-7 py-3",
    "ghost-sm": "border border-[var(--border)] bg-[var(--glass)] font-medium text-xs text-[var(--text-muted)] px-4 py-[7px] rounded-lg hover:border-[var(--teal)] hover:text-[var(--teal)]",
  };
  const sizes = size === "lg" && variant === "primary" ? "px-9 py-4 text-base" : "";
  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${sizes} ${className}`.trim()}
      data-testid={rest["data-testid"]}
      {...rest}
    >
      {children}
    </button>
  );
}
