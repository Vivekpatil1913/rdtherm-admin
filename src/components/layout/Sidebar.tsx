"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { navGroups } from "@/config/navigation";
import { dashboardService } from "@/services";
import { Logo } from "./Logo";
import { cn } from "@/lib/cn";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  // Live "new" counts shown as badges on the engagement links.
  const [counts, setCounts] = useState({ leads: 0, quotes: 0, applications: 0 });
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      dashboardService
        .stats()
        .then(
          (s) =>
            !cancelled &&
            setCounts({ leads: s.leadsNew, quotes: s.quotesNew, applications: s.applicationsNew }),
        )
        .catch(() => {});
    load();
    // Refresh immediately when a record's status changes (same-route updates).
    window.addEventListener("rdtherm:stats", load);
    return () => {
      cancelled = true;
      window.removeEventListener("rdtherm:stats", load);
    };
    // Also refresh whenever the route changes (e.g. after triaging a record).
  }, [pathname]);

  const badgeFor = (href: string) => {
    const n =
      href === "/leads"
        ? counts.leads
        : href === "/quotes"
          ? counts.quotes
          : href === "/applications"
            ? counts.applications
            : 0;
    return n > 0 ? String(n) : undefined;
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-[width,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed ? "w-[var(--spacing-sidebar-collapsed)]" : "w-[var(--spacing-sidebar)]",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Logo collapsed={collapsed} />
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-md p-1 text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="thin-scrollbar flex-1 overflow-y-auto px-3 pb-6">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-5">
              {!collapsed ? (
                <p className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                  {group.title}
                </p>
              ) : (
                <div className="mx-2 mb-1.5 h-px bg-[var(--color-border)]" />
              )}
              <ul className="flex flex-col gap-0.5">
                {group.links.map((link) => (
                  <SidebarLink key={link.href} link={link} collapsed={collapsed} badge={badgeFor(link.href)} />
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

function SidebarLink({
  link,
  collapsed,
  badge,
}: {
  link: (typeof navGroups)[number]["links"][number];
  collapsed: boolean;
  badge?: string;
}) {
  const pathname = usePathname();
  const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
  const Icon = link.icon;
  const badgeText = badge ?? link.badge;

  return (
    <li>
      <Link
        href={link.href}
        title={collapsed ? link.label : undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-[10px] px-2.5 py-2 text-[13.5px] font-medium transition-colors",
          collapsed && "justify-center",
          active
            ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)]"
            : "text-[var(--color-content-soft)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-content)]",
        )}
      >
        {active ? (
          <motion.span
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[var(--color-brand-strong)]"
          />
        ) : null}
        <Icon className="size-[18px] shrink-0" />
        {!collapsed ? <span className="flex-1 truncate">{link.label}</span> : null}
        {!collapsed && badgeText ? (
          <span className="rounded-full bg-[var(--color-brand-strong)] px-1.5 py-0.5 text-[10px] font-bold text-white">
            {badgeText}
          </span>
        ) : null}
      </Link>
    </li>
  );
}
