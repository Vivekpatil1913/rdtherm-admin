import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-16 text-center", className)}>
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--color-bg-subtle)] text-[var(--color-muted)]">
        <Icon className="size-7" />
      </div>
      <h3 className="text-base font-semibold text-[var(--color-content)]">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-[var(--color-muted)]">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
