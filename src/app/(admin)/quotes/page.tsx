"use client";

import { useState } from "react";
import { Mail, Phone, Building2, MapPin, Globe, Package, Inbox } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { TableToolbar } from "@/components/data-table/TableToolbar";
import { RowActionBar } from "@/components/data-table/RowActionBar";
import { useResource } from "@/hooks/useResource";
import { quoteService } from "@/services";
import { formatRelative } from "@/lib/format";
import type { QuoteRequest } from "@/types";

export default function QuotesPage() {
  const resource = useResource<QuoteRequest>(quoteService, { initialSort: { sortBy: "createdAt", sortDir: "desc" } });
  const [viewing, setViewing] = useState<QuoteRequest | null>(null);

  // List payloads omit the heavy message/configuration fields, so fetch the
  // full record when opening the detail view.
  const openView = async (row: QuoteRequest) => {
    setViewing(row);
    const full = await quoteService.get(row.id);
    if (full) setViewing(full);
  };

  const columns: Column<QuoteRequest>[] = [
    {
      key: "name",
      header: "Contact",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--color-content)]">{row.name}</p>
          <p className="text-[12px] text-[var(--color-muted)]">{row.email}</p>
        </div>
      ),
    },
    { key: "company", header: "Company", render: (row) => <span className="text-[13px]">{row.company}</span> },
    {
      key: "city",
      header: "Location",
      render: (row) => (
        <span className="text-[13px] text-[var(--color-muted)]">
          {[row.city, row.country].filter(Boolean).join(", ") || "—"}
        </span>
      ),
    },
    {
      key: "quoteType",
      header: "Type",
      render: (row) => (
        <Badge tone={row.quoteType === "custom" ? "brand" : "neutral"}>
          {row.quoteType === "custom" ? "Custom" : "Standard"}
        </Badge>
      ),
    },
    { key: "createdAt", header: "Received", sortable: true, render: (row) => <span className="text-[13px] text-[var(--color-muted)]">{formatRelative(row.createdAt)}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Quote Requests"
        description="Air Receiver configurator and custom-build quote requests submitted from the website."
      />

      <Card className="overflow-hidden">
        <TableToolbar
          search={resource.search}
          onSearch={resource.setSearch}
          searchPlaceholder="Search by name, email, company or location…"
        />
        <DataTable<QuoteRequest>
          columns={columns}
          rows={resource.items}
          loading={resource.isLoading}
          showIndex
          startIndex={(resource.page - 1) * resource.pageSize}
          sortBy={resource.sort?.sortBy}
          sortDir={resource.sort?.sortDir}
          onSort={resource.toggleSort}
          rowActions={(row) => (
            <RowActionBar onView={() => openView(row)} />
          )}
          empty={{ icon: Inbox, title: "No quote requests yet", description: "New quote requests from the website will appear here." }}
        />
        {resource.items.length ? (
          <div className="border-t border-[var(--color-border)]">
            <Pagination page={resource.page} totalPages={resource.totalPages} total={resource.total} pageSize={resource.pageSize} onPageChange={resource.setPage} />
          </div>
        ) : null}
      </Card>

      {/* Quote detail */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing ? `${viewing.productName} — ${viewing.quoteType === "custom" ? "Custom build" : "Standard"}` : undefined}
        description={viewing ? `From ${viewing.name} · ${formatRelative(viewing.createdAt)}` : undefined}
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setViewing(null)}>
            Close
          </Button>
        }
      >
        {viewing ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoRow icon={<Mail className="size-4" />} label="Email" value={viewing.email} />
              <InfoRow icon={<Phone className="size-4" />} label="Mobile" value={viewing.mobile} />
              <InfoRow icon={<Building2 className="size-4" />} label="Company" value={viewing.company} />
              <InfoRow icon={<MapPin className="size-4" />} label="City" value={viewing.city || "—"} />
              <InfoRow icon={<Globe className="size-4" />} label="Country" value={viewing.country || "—"} />
              <InfoRow icon={<Inbox className="size-4" />} label="Source" value={viewing.source} />
            </div>

            {/* Attached configuration */}
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-content)]">
                <Package className="size-4 text-[var(--color-muted)]" /> Attached configuration
              </p>
              {viewing.configuration?.length ? (
                <dl className="overflow-hidden rounded-[var(--radius-field)] border border-[var(--color-border)]">
                  {viewing.configuration.map((line, i) => (
                    <div
                      key={`${line.label}-${i}`}
                      className="flex items-baseline justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2.5 last:border-b-0"
                    >
                      <dt className="text-[12.5px] text-[var(--color-muted)]">{line.label}</dt>
                      <dd className="text-right text-[13px] font-medium text-[var(--color-content)]">{line.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-[13px] text-[var(--color-muted)]">No configuration attached.</p>
              )}
            </div>

            {viewing.message ? (
              <div>
                <p className="mb-1.5 text-[13px] font-medium text-[var(--color-content)]">Message</p>
                <div className="rounded-[var(--radius-field)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 text-sm leading-relaxed text-[var(--color-content-soft)] whitespace-pre-wrap">
                  {viewing.message}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-[var(--color-muted)]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-[var(--color-muted)]">{label}</p>
        <p className="truncate text-[13px] font-medium text-[var(--color-content)]">{value}</p>
      </div>
    </div>
  );
}
