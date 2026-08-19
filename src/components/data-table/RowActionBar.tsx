"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/cn";

interface RowActionBarProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Render Delete greyed out and inert — for rows that must not be removed. */
  deleteDisabled?: boolean;
  /** Tooltip explaining why Delete is disabled. */
  deleteDisabledReason?: string;
  /** Active/inactive toggle — pass both to render it. */
  active?: boolean;
  onToggle?: (active: boolean) => void;
  /** Lower-case entity label used in the confirmation copy, e.g. "industry". */
  toggleEntity?: string;
}

/**
 * Inline row actions: View, Edit, Delete and an active/inactive toggle.
 * The toggle opens a confirmation dialog before activating/deactivating.
 * Each control is optional — only the ones whose handlers are provided render.
 */
export function RowActionBar({
  onView,
  onEdit,
  onDelete,
  deleteDisabled,
  deleteDisabledReason,
  active,
  onToggle,
  toggleEntity = "item",
}: RowActionBarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const willActivate = !active;

  return (
    <div className="flex items-center justify-end gap-1.5">
      {onView ? (
        <IconButton label="View" onClick={onView} className="text-[var(--color-info)] hover:bg-[var(--color-info-soft)]">
          <Eye className="size-[18px]" />
        </IconButton>
      ) : null}
      {onEdit ? (
        <IconButton label="Edit" onClick={onEdit} className="text-[var(--color-brand-strong)] hover:bg-[var(--color-brand-soft)]">
          <Pencil className="size-[18px]" />
        </IconButton>
      ) : null}
      {onDelete ? (
        <IconButton
          label={deleteDisabled ? deleteDisabledReason ?? "Delete is not allowed" : "Delete"}
          onClick={onDelete}
          disabled={deleteDisabled}
          className="text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
        >
          <Trash2 className="size-[18px]" />
        </IconButton>
      ) : null}
      {onToggle ? (
        <>
          <Toggle
            checked={!!active}
            onChange={() => setConfirmOpen(true)}
            size="sm"
            label={`${active ? "Deactivate" : "Activate"} ${toggleEntity}`}
            className="ml-1"
          />
          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={() => {
              setConfirmOpen(false);
              onToggle(willActivate);
            }}
            danger={!willActivate}
            title={willActivate ? `Activate this ${toggleEntity}?` : `Deactivate this ${toggleEntity}?`}
            confirmLabel={willActivate ? "Activate" : "Deactivate"}
            body={
              willActivate
                ? `This ${toggleEntity} will become active and visible on the website.`
                : `This ${toggleEntity} will be deactivated and hidden from the website. You can reactivate it anytime.`
            }
          />
        </>
      ) : null}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md transition-colors",
        disabled
          ? "cursor-not-allowed text-[var(--color-muted)] opacity-50"
          : className,
      )}
    >
      {children}
    </button>
  );
}
