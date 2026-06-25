"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown, type LucideIcon } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";

export interface Column<T> {
  /** Stable key; also used as the sort field when `sortable`. */
  key: string;
  header: string;
  /** Cell renderer. Receives the full row. */
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  className?: string;
  /** Fixed width utility class, e.g. "w-24". */
  width?: string;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  /** Show a leading "Sr No." column. */
  showIndex?: boolean;
  /** Offset for the serial number (e.g. (page - 1) * pageSize). */
  startIndex?: number;
  selectable?: boolean;
  selectedIds?: string[];
  onToggleRow?: (id: string) => void;
  onToggleAll?: (checked: boolean) => void;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSort?: (key: string) => void;
  rowActions?: (row: T) => React.ReactNode;
  empty: { icon: LucideIcon; title: string; description?: string; action?: React.ReactNode };
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  loading,
  showIndex,
  startIndex = 0,
  selectable,
  selectedIds = [],
  onToggleRow,
  onToggleAll,
  sortBy,
  sortDir,
  onSort,
  rowActions,
  empty,
}: DataTableProps<T>) {
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;

  if (loading) {
    return <TableSkeleton rows={6} cols={columns.length + (selectable || showIndex ? 1 : 0)} />;
  }

  if (!rows.length) {
    return (
      <EmptyState
        icon={empty.icon}
        title={empty.title}
        description={empty.description}
        action={empty.action}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-center">
            {showIndex ? (
              <th className="w-14 px-5 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                Sr No.
              </th>
            ) : null}
            {selectable ? (
              <th className="w-10 px-5 py-3">
                <Checkbox
                  checked={allSelected}
                  onChange={(c) => onToggleAll?.(c)}
                  aria-label="Select all rows"
                />
              </th>
            ) : null}
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted)]",
                  col.width,
                )}
              >
                {col.sortable && onSort ? (
                  <button
                    type="button"
                    onClick={() => onSort(col.key)}
                    className="inline-flex items-center gap-1 transition-colors hover:text-[var(--color-content)]"
                  >
                    {col.header}
                    {sortBy === col.key ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="size-3.5" />
                      ) : (
                        <ArrowDown className="size-3.5" />
                      )
                    ) : (
                      <ChevronsUpDown className="size-3.5 opacity-50" />
                    )}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
            {rowActions ? (
              <th className="w-px whitespace-nowrap px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                Actions
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const selected = selectedIds.includes(row.id);
            return (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-[var(--color-border)] transition-colors last:border-b-0 hover:bg-[var(--color-surface-hover)]",
                  selected && "bg-[var(--color-brand-soft)]/40",
                )}
              >
                {showIndex ? (
                  <td className="px-5 py-3.5 text-[13px] tabular-nums text-[var(--color-muted)]">
                    {startIndex + i + 1}
                  </td>
                ) : null}
                {selectable ? (
                  <td className="px-5 py-3.5">
                    <Checkbox
                      checked={selected}
                      onChange={() => onToggleRow?.(row.id)}
                      aria-label="Select row"
                    />
                  </td>
                ) : null}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3.5 text-[var(--color-content-soft)] align-middle",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.className,
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
                {rowActions ? (
                  <td className="px-4 py-3.5 text-right">{rowActions(row)}</td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  ...props
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  "aria-label"?: string;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="size-4 cursor-pointer rounded border-[var(--color-border-strong)] accent-[var(--color-brand-strong)]"
      {...props}
    />
  );
}
