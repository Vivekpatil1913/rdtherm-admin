"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, PanelLeftClose, PanelLeft, Settings, User } from "lucide-react";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { Avatar } from "@/components/ui/Avatar";
import { Dropdown, MenuItem } from "@/components/ui/Dropdown";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/providers/AuthProvider";

interface TopbarProps {
  crumbs: Crumb[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
}

export function Topbar({ crumbs, collapsed, onToggleCollapse, onOpenMobile }: TopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_85%,transparent)] px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="inline-flex size-9 items-center justify-center rounded-[10px] border border-[var(--color-border)] text-[var(--color-content-soft)] hover:bg-[var(--color-surface-hover)] lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-[18px]" />
        </button>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden size-9 items-center justify-center rounded-[10px] border border-[var(--color-border)] text-[var(--color-content-soft)] hover:bg-[var(--color-surface-hover)] lg:inline-flex"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <PanelLeft className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}
        </button>
        <div className="hidden sm:block">
          <Breadcrumbs items={crumbs} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <Dropdown
          trigger={
            <button
              type="button"
              className="flex items-center gap-2 rounded-[10px] border border-transparent py-1 pl-1 pr-2 transition-colors hover:bg-[var(--color-surface-hover)]"
            >
              <Avatar name={user?.name ?? "Admin"} src={user?.avatar} size="sm" />
              <span className="hidden text-left sm:block">
                <span className="block text-[13px] font-semibold leading-tight text-[var(--color-content)]">
                  {user?.name ?? "Admin"}
                </span>
                <span className="block text-[11px] leading-tight text-[var(--color-muted)]">
                  {user?.role ?? "Administrator"}
                </span>
              </span>
              <ChevronDown className="size-4 text-[var(--color-muted)]" />
            </button>
          }
        >
          <div className="border-b border-[var(--color-border)] px-2.5 py-2">
            <p className="text-[13px] font-semibold text-[var(--color-content)]">{user?.name}</p>
            <p className="text-[11px] text-[var(--color-muted)]">{user?.email}</p>
          </div>
          <div className="py-1">
            <MenuItem icon={<User className="size-4" />} onClick={() => router.push("/profile")}>
              My profile
            </MenuItem>
            <MenuItem icon={<Settings className="size-4" />} onClick={() => router.push("/account-settings")}>
              Account settings
            </MenuItem>
          </div>
          <div className="border-t border-[var(--color-border)] pt-1">
            <MenuItem icon={<LogOut className="size-4" />} danger onClick={handleLogout}>
              Sign out
            </MenuItem>
          </div>
        </Dropdown>
      </div>
    </header>
  );
}
