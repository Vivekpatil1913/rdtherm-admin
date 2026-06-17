"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, rows = 4, maxLength, value, ...props },
  ref,
) {
  return (
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
});
