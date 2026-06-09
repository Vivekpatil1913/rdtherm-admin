import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px]">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-content)]"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-[var(--color-content)]" : "text-[var(--color-muted)]"}>
                {item.label}
              </span>
            )}
            {!isLast ? <ChevronRight className="size-3.5 text-[var(--color-muted)]" /> : null}
          </span>
        );
      })}
    </nav>
  );
}
