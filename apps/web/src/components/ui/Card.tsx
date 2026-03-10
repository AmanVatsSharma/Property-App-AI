/**
 * @file Card.tsx
 * @module ui
 * @description Card container using design tokens
 * @author BharatERP
 * @created 2025-03-10
 */

import type { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  "data-testid"?: string;
}

export function Card({ className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={`card ${className}`.trim()}
      data-testid={rest["data-testid"]}
      {...rest}
    >
      {children}
    </div>
  );
}
