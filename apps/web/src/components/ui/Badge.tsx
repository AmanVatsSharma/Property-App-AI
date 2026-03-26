/**
 * @file Badge.tsx
 * @module components/ui
 * @description Badge component with UrbanNest variants
 * @author BharatERP
 * @created 2026-03-26
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--teal-dim)] border border-[rgba(0,212,170,0.25)] text-[var(--teal)]",
        teal: "bg-[var(--teal-dim)] border border-[rgba(0,212,170,0.25)] text-[var(--teal)]",
        coral: "bg-[var(--coral-dim)] border border-[rgba(255,107,74,0.25)] text-[var(--coral)]",
        gold: "bg-[var(--gold-dim)] border border-[rgba(245,200,66,0.25)] text-[var(--gold)]",
        green: "bg-[var(--green-dim)] border border-[rgba(74,222,128,0.25)] text-[var(--green)]",
        indigo: "bg-[var(--indigo-dim)] border border-[rgba(99,102,241,0.25)] text-[var(--indigo)]",
        glass: "bg-[var(--glass)] border border-[var(--glass-border)] text-[var(--text-muted)]",
        outline: "border border-[var(--border)] text-[var(--text-muted)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
