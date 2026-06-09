"use client";

import { Reorder, useDragControls } from "framer-motion";
import { GripVertical } from "lucide-react";

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
}

/**
 * Drag-and-drop reorderable list built on framer-motion's Reorder.
 * Each row exposes an explicit drag handle so inner controls stay clickable.
 */
export function SortableList<T extends { id: string }>({ items, onReorder, renderItem }: SortableListProps<T>) {
  return (
    <Reorder.Group axis="y" values={items} onReorder={onReorder} className="flex flex-col gap-2.5">
      {items.map((item) => (
        <SortableRow key={item.id} item={item}>
          {renderItem(item)}
        </SortableRow>
      ))}
    </Reorder.Group>
  );
}

function SortableRow<T extends { id: string }>({ item, children }: { item: T; children: React.ReactNode }) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)]"
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        className="cursor-grab touch-none rounded-md p-1 text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-content)] active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-5" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </Reorder.Item>
  );
}
