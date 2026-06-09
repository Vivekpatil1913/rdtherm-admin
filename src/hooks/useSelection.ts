"use client";

import { useCallback, useState } from "react";

/** Tracks a set of selected row ids for bulk actions. */
export function useSelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const toggleAll = useCallback((ids: string[], checked: boolean) => {
    setSelectedIds(checked ? ids : []);
  }, []);

  const clear = useCallback(() => setSelectedIds([]), []);

  return { selectedIds, toggle, toggleAll, clear, setSelectedIds };
}
