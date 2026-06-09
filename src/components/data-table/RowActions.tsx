"use client";

import { MoreHorizontal } from "lucide-react";
import { Dropdown } from "@/components/ui/Dropdown";

/** Standard "⋯" row-action trigger wrapping a Dropdown of MenuItems. */
export function RowActions({ children }: { children: React.ReactNode }) {
  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className="inline-flex size-8 items-center justify-center rounded-md text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-content)]"
          aria-label="Row actions"
        >
          <MoreHorizontal className="size-[18px]" />
        </button>
      }
    >
      {children}
    </Dropdown>
  );
}
