/**
 * @file Input.tsx
 * @module ui
 * @description Text input primitive using design tokens
 * @author BharatERP
 * @created 2025-03-10
 */

import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  "data-testid"?: string;
}

export function Input({
  label,
  error,
  id: idProp,
  className = "",
  ...rest
}: InputProps) {
  const id = idProp ?? rest.name ?? `input-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className="block">
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`input ${className}`.trim()}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        data-testid={rest["data-testid"]}
        {...rest}
      />
      {error && (
        <span id={`${id}-error`} className="block mt-1 text-xs text-[var(--coral)]" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
