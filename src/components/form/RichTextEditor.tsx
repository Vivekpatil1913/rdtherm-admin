"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Undo2,
  Redo2,
  Code,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** When false, renders read-only content (no toolbar, not editable). */
  editable?: boolean;
}

interface ToolButton {
  icon: typeof Bold;
  command: string;
  arg?: string;
  label: string;
}

const GROUPS: ToolButton[][] = [
  [
    { icon: Bold, command: "bold", label: "Bold" },
    { icon: Italic, command: "italic", label: "Italic" },
    { icon: Underline, command: "underline", label: "Underline" },
  ],
  [
    { icon: Heading2, command: "formatBlock", arg: "h2", label: "Heading 2" },
    { icon: Heading3, command: "formatBlock", arg: "h3", label: "Heading 3" },
    { icon: Quote, command: "formatBlock", arg: "blockquote", label: "Quote" },
    { icon: Code, command: "formatBlock", arg: "pre", label: "Code block" },
  ],
  [
    { icon: List, command: "insertUnorderedList", label: "Bullet list" },
    { icon: ListOrdered, command: "insertOrderedList", label: "Numbered list" },
  ],
];

/**
 * Lightweight rich-text editor built on contentEditable + document.execCommand.
 * It outputs the same HTML tag set the public site's `.prose-article` styles
 * expect, so authors get a faithful preview. The editor is intentionally
 * dependency-free; it can be swapped for Tiptap/Lexical later behind this same
 * `value`/`onChange` contract.
 */
export function RichTextEditor({ value, onChange, placeholder, editable = true }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  // Sync incoming value only when it diverges from the live DOM (avoids caret jumps).
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const handleLink = () => {
    const url = window.prompt("Enter URL");
    if (url) exec("createLink", url);
  };

  const handleInput = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-field)] border bg-[var(--color-surface)] transition-colors",
        focused ? "border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/20" : "border-[var(--color-border-strong)]",
      )}
    >
      {editable ? (
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2 py-1.5">
        {GROUPS.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5 border-r border-[var(--color-border)] pr-1 last:border-r-0">
            {group.map((btn) => (
              <ToolbarBtn key={btn.label} label={btn.label} onClick={() => exec(btn.command, btn.arg)}>
                <btn.icon className="size-4" />
              </ToolbarBtn>
            ))}
          </div>
        ))}
        <div className="flex items-center gap-0.5 border-r border-[var(--color-border)] pr-1">
          <ToolbarBtn label="Insert link" onClick={handleLink}>
            <Link2 className="size-4" />
          </ToolbarBtn>
        </div>
        <div className="flex items-center gap-0.5">
          <ToolbarBtn label="Undo" onClick={() => exec("undo")}>
            <Undo2 className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn label="Redo" onClick={() => exec("redo")}>
            <Redo2 className="size-4" />
          </ToolbarBtn>
        </div>
      </div>
      ) : null}

      <div className="relative">
        <div
          ref={ref}
          contentEditable={editable}
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="prose-cms min-h-56 max-w-none break-words px-4 py-3 focus:outline-none"
        />
        {!value ? (
          <p className="pointer-events-none absolute left-4 top-3 text-sm text-[var(--color-muted)]">
            {placeholder ?? "Write your content…"}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ToolbarBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded-md text-[var(--color-content-soft)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-content)]"
    >
      {children}
    </button>
  );
}
