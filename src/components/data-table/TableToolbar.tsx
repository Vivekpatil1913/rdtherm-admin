"use client";

import { Search, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface FilterControl {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  width?: string;
}

interface TableToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterControl[];
  selectedCount?: number;
  onClearSelection?: () => void;
  onBulkDelete?: () => void;
  bulkExtra?: React.ReactNode;
}

export function TableToolbar({
  search,
  onSearch,
  searchPlaceholder = "Search…",
  filters = [],
  selectedCount = 0,
  onClearSelection,
  onBulkDelete,
  bulkExtra,
}: TableToolbarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      {hasSelection ? (
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClearSelection}
              className="inline-flex size-7 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)]"
              aria-label="Clear selection"
            >
              <X className="size-4" />
            </button>
            <span className="text-sm font-medium text-[var(--color-content)]">
              {selectedCount} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            {bulkExtra}
            {onBulkDelete ? (
              <Button variant="outline" size="sm" leftIcon={<Trash2 className="size-4" />} onClick={onBulkDelete}>
                Delete
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div className="w-full sm:max-w-xs">
            <Input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              leftIcon={<Search className="size-4" />}
            />
          </div>
          {filters.length ? (
            <div className="flex flex-wrap items-center gap-2">
              {filters.map((filter, i) => (
                <div key={i} className={cn("min-w-36", filter.width)}>
                  <Select value={filter.value} onChange={(e) => filter.onChange(e.target.value)} options={filter.options} />
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
