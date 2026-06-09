"use client";

import { cn } from "@/lib/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function Toggle({ checked, onChange, disabled, label, size = "md", className }: ToggleProps) {
  const dims =
    size === "sm"
      ? { track: "h-5 w-9", knob: "size-3.5", shift: "translate-x-4" }
      : { track: "h-6 w-11", knob: "h-[18px] w-[18px]", shift: "translate-x-5" };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        dims.track,
        checked ? "bg-[var(--color-brand-strong)]" : "bg-[var(--color-border-strong)]",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block rounded-full bg-white shadow-sm transition-transform duration-200",
          dims.knob,
          checked ? dims.shift : "translate-x-0",
        )}
      />
    </button>
  );
}
