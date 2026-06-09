"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  /** Show a live "n/max" counter below the field (requires maxLength). */
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, rows = 4, showCount, maxLength, value, ...props },
  ref,
) {
  const textarea = (
    <textarea
      ref={ref}
      rows={rows}
      maxLength={maxLength}
      value={value}
      className={cn(
        "w-full rounded-[var(--radius-field)] border bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-content)] placeholder:text-[var(--color-muted)] transition-colors resize-y",
        "focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20",
        "disabled:cursor-not-allowed disabled:opacity-60",
        invalid ? "border-[var(--color-danger)]" : "border-[var(--color-border-strong)]",
        className,
      )}
      {...props}
    />
  );

  if (!showCount || !maxLength) return textarea;

  const len = String(value ?? "").length;
  return (
    <div>
      {textarea}
      <div
        className={cn(
          "mt-1 text-right text-[11px] font-medium tabular-nums",
          len >= maxLength ? "text-[var(--color-danger)]" : "text-[var(--color-muted)]",
        )}
      >
        {len}/{maxLength}
      </div>
    </div>
  );
});
