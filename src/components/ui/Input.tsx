"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leftIcon?: React.ReactNode;
  /** Show a live "n/max" counter below the field (requires maxLength). */
  showCount?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, leftIcon, showCount, maxLength, value, ...props },
  ref,
) {
  const len = String(value ?? "").length;
  return (
    <div className="relative">
      {leftIcon ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
          {leftIcon}
        </span>
      ) : null}
      <input
        ref={ref}
        maxLength={maxLength}
        value={value}
        className={cn(
          "h-10 w-full rounded-[var(--radius-field)] border bg-[var(--color-surface)] px-3 text-sm text-[var(--color-content)] placeholder:text-[var(--color-muted)] transition-colors",
          "focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20",
          "disabled:cursor-not-allowed disabled:opacity-60",
          leftIcon && "pl-9",
          invalid
            ? "border-[var(--color-danger)]"
            : "border-[var(--color-border-strong)]",
          className,
        )}
        {...props}
      />
      {showCount && maxLength ? (
        <div
          className={cn(
            "mt-1 text-right text-[11px] font-medium tabular-nums",
            len >= maxLength ? "text-[var(--color-danger)]" : "text-[var(--color-muted)]",
          )}
        >
          {len}/{maxLength}
        </div>
      ) : null}
    </div>
  );
});
