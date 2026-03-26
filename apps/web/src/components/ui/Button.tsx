/**
 * @file Button.tsx
 * @module components/ui
 * @description Premium button component using CVA, mapped to UrbanNest design tokens
 * @author BharatERP
 * @created 2026-03-26
 */
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--teal)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-[var(--teal)] to-[#00c49a] text-[var(--btn-primary-text)] shadow-[var(--shadow-glow-teal)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,212,170,0.4)]",
        outline:
          "border border-[var(--glass-border)] bg-transparent text-[var(--text)] hover:border-[var(--teal)] hover:text-[var(--teal)] hover:bg-[var(--teal-dim)]",
        ghost:
          "bg-transparent text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text)]",
        secondary:
          "bg-[var(--dark-3)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--teal)] hover:text-[var(--teal)]",
        destructive:
          "bg-[var(--coral)] text-white hover:bg-[var(--coral)] hover:opacity-90",
        teal:
          "bg-[var(--teal-dim)] text-[var(--teal)] border border-[rgba(0,212,170,0.25)] hover:bg-[var(--teal)] hover:text-[var(--btn-primary-text)]",
        /** Legacy aliases kept for backward compat with className-based usage */
        primary:
          "bg-gradient-to-br from-[var(--teal)] to-[#00c49a] text-[var(--btn-primary-text)] shadow-[var(--shadow-glow-teal)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,212,170,0.4)]",
        "ghost-sm":
          "border border-[var(--border)] bg-[var(--glass)] font-medium text-[var(--text-muted)] hover:border-[var(--teal)] hover:text-[var(--teal)]",
      },
      size: {
        default: "h-10 px-5 py-2 text-sm rounded-full",
        sm: "h-8 px-3 text-xs rounded-full",
        lg: "h-12 px-8 text-base rounded-full",
        xl: "h-14 px-10 text-base rounded-full",
        icon: "h-9 w-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
