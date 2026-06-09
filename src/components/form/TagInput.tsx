"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface TagInputProps {
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  invalid?: boolean;
}

/** Comma / Enter-separated chips — used for specs, materials, applications. */
export function TagInput({ value, onChange, placeholder, invalid }: TagInputProps) {
  const [draft, setDraft] = useState("");
  const tags = Array.isArray(value) ? value : [];

  const add = () => {
    const trimmed = draft.trim();
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed]);
    setDraft("");
  };

  const remove = (tag: string) => onChange(tags.filter((t) => t !== tag));

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 rounded-[var(--radius-field)] border bg-[var(--color-surface)] p-2 transition-colors focus-within:border-[var(--color-brand)] focus-within:ring-2 focus-within:ring-[var(--color-brand)]/20",
        invalid ? "border-[var(--color-danger)]" : "border-[var(--color-border-strong)]",
      )}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-[var(--color-bg-subtle)] py-1 pl-2.5 pr-1.5 text-[13px] font-medium text-[var(--color-content-soft)]"
        >
          {tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            className="rounded p-0.5 text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-content)]"
            aria-label={`Remove ${tag}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && tags.length) {
            remove(tags[tags.length - 1]);
          }
        }}
        onBlur={add}
        placeholder={tags.length ? "" : placeholder ?? "Type and press Enter…"}
        className="min-w-32 flex-1 bg-transparent px-1.5 py-1 text-sm text-[var(--color-content)] placeholder:text-[var(--color-muted)] focus:outline-none"
      />
    </div>
  );
}
