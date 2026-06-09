"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Boxes, Newspaper, Inbox, Quote, FileText, Trophy, Users, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { StatCard } from "@/components/cms/StatCard";
import { LeadStatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/providers/AuthProvider";
import { dashboardService } from "@/services";
import type { DashboardStats } from "@/services";
import { formatRelative } from "@/lib/format";

const QUICK_ACTIONS = [
  { label: "New blog post", href: "/blogs/new", icon: FileText },
  { label: "Add product", href: "/products/new", icon: Boxes },
  { label: "Add testimonial", href: "/testimonials", icon: Quote },
  { label: "Add case study", href: "/case-studies", icon: Trophy },
  { label: "Manage team", href: "/team", icon: Users },
  { label: "View leads", href: "/leads", icon: Inbox },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .stats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const leads = stats?.recentLeads ?? [];

  return (
    <>
      <PageHeader
        title={`Good to see you, ${user?.name?.split(" ")[0] ?? "Admin"} 👋`}
        description="A live overview of your website content and enquiries."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-[var(--radius-card)]" />)
        ) : (
          <>
            <StatCard label="Products" value={stats.totals.products} icon={Boxes} hint={`${stats.activeProducts} active`} />
            <StatCard label="Articles" value={stats.totals.blogs} icon={Newspaper} hint={`${stats.activeBlogs} active`} />
            <StatCard label="New leads" value={stats.leadsNew} icon={Inbox} hint={`${stats.totals.leads} total enquiries`} />
            <StatCard label="Testimonials" value={stats.totals.testimonials} icon={Quote} />
          </>
        )}
      </div>

      {/* Quick actions */}
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group flex flex-col items-center gap-2.5 rounded-[var(--radius-card)] border border-[var(--color-border)] p-4 text-center transition-all hover:border-[var(--color-brand-strong)] hover:shadow-[var(--shadow-card)]"
              >
                <span className="flex size-10 items-center justify-center rounded-[10px] bg-[var(--color-bg-subtle)] text-[var(--color-content-soft)] transition-colors group-hover:bg-[var(--color-brand-soft)] group-hover:text-[var(--color-brand-strong)]">
                  <action.icon className="size-5" />
                </span>
                <span className="text-[12.5px] font-medium text-[var(--color-content-soft)]">{action.label}</span>
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Recent leads */}
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Recent leads</CardTitle>
          <Link href="/leads" className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-brand-strong)] hover:underline">
            Inbox <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex flex-col gap-4 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : leads.length ? (
            <ul className="divide-y divide-[var(--color-border)]">
              {leads.slice(0, 6).map((lead) => (
                <li key={lead.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[var(--color-content)]">{lead.name}</p>
                    <p className="truncate text-[12px] text-[var(--color-muted)]">
                      {lead.company || lead.email} · {formatRelative(lead.createdAt)}
                    </p>
                  </div>
                  <LeadStatusBadge status={lead.leadStatus} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Inbox} title="No leads yet" description="Enquiries from the website will appear here." />
          )}
        </CardBody>
      </Card>
    </>
  );
}
