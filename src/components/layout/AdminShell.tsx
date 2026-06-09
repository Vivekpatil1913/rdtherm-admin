"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { allNavLinks } from "@/config/navigation";
import { getStored, setStored } from "@/lib/storage";
import { useAuth } from "@/providers/AuthProvider";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/cn";

const COLLAPSE_KEY = "rdtherm-admin-sidebar-collapsed";

/** Build breadcrumbs from the current path against the nav registry. */
function useCrumbs(pathname: string): Crumb[] {
  return useMemo(() => {
    const crumbs: Crumb[] = [{ label: "Home", href: "/dashboard" }];
    const segments = pathname.split("/").filter(Boolean);
    if (!segments.length) return crumbs;

    const base = `/${segments[0]}`;
    const match = allNavLinks.find((l) => l.href === base);
    crumbs.push({ label: match?.label ?? titleize(segments[0]), href: base });

    if (segments.length > 1) {
      const last = segments[segments.length - 1];
      crumbs.push({ label: last === "new" ? "New" : titleize(last) });
    }
    return crumbs;
  }, [pathname]);
}

function titleize(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const crumbs = useCrumbs(pathname);

  useEffect(() => {
    setCollapsed(getStored(COLLAPSE_KEY, false));
  }, []);

  // Protected route guard — redirect to login if no session.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      setStored(COLLAPSE_KEY, !prev);
      return !prev;
    });
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="size-8 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-brand-strong)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed ? "lg:pl-[var(--spacing-sidebar-collapsed)]" : "lg:pl-[var(--spacing-sidebar)]",
        )}
      >
        <Topbar
          crumbs={crumbs}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
