import { cn } from "@/lib/cn";

interface FieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** Current value length — renders a live "count/max" counter in the footer. */
  count?: number;
  /** Max length for the counter (and the danger colour once reached). */
  max?: number;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, error, hint, required, count, max, className, children }: FieldProps) {
  const showCount = typeof count === "number" && typeof max === "number";
  const showFooter = !!error || !!hint || showCount;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-[var(--color-content)]">
          {label}
          {required ? <span className="ml-0.5 text-[var(--color-danger)]">*</span> : null}
        </label>
      ) : null}
      {children}
      {showFooter ? (
        <div className="flex items-start justify-between gap-3">
          {error ? (
            <p className="text-xs text-[var(--color-danger)]">{error}</p>
          ) : hint ? (
            <p className="text-xs text-[var(--color-muted)]">{hint}</p>
          ) : (
            <span aria-hidden />
          )}
          {showCount ? (
            <span
              className={cn(
                "shrink-0 text-[11px] font-medium tabular-nums leading-5",
                count >= max ? "text-[var(--color-danger)]" : "text-[var(--color-muted)]",
              )}
            >
              {count}/{max}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Two-column section used inside settings / detail forms. */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 border-b border-[var(--color-border)] py-7 last:border-b-0 md:grid-cols-[260px_1fr]">
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-content)]">{title}</h3>
        {description ? (
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-muted)]">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
