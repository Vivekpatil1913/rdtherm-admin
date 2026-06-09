"use client";

import { useState } from "react";
import { Inbox, Mail, Phone, Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LeadStatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { TableToolbar } from "@/components/data-table/TableToolbar";
import { RowActionBar } from "@/components/data-table/RowActionBar";
import { useResource } from "@/hooks/useResource";
import { useCrud } from "@/hooks/useCrud";
import { leadService } from "@/services";
import { useToast } from "@/providers/ToastProvider";
import { formatRelative, truncate } from "@/lib/format";
import type { Lead, LeadStatus } from "@/types";

const TABS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "in-progress", label: "In progress" },
  { value: "qualified", label: "Qualified" },
  { value: "closed", label: "Closed" },
];

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "in-progress", label: "In progress" },
  { value: "qualified", label: "Qualified" },
  { value: "closed", label: "Closed" },
];

export default function LeadsPage() {
  const resource = useResource<Lead>(leadService, { initialSort: { sortBy: "createdAt", sortDir: "desc" } });
  const crud = useCrud(leadService, "Lead");
  const toast = useToast();
  const [viewing, setViewing] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState<Lead | null>(null);

  // The "status" tab maps to the lead-specific status field.
  const leadStatusFilter = resource.status;

  const updateStatus = async (lead: Lead, leadStatus: LeadStatus) => {
    await leadService.update(lead.id, { leadStatus });
    setViewing((v) => (v ? { ...v, leadStatus } : v));
    toast.success("Lead updated", `Marked as ${leadStatus.replace("-", " ")}.`);
    resource.refetch();
  };

  const columns: Column<Lead>[] = [
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
    { key: "subject", header: "Subject", render: (row) => <p className="max-w-xs text-[13px]">{truncate(row.subject, 50)}</p> },
    { key: "createdAt", header: "Received", sortable: true, render: (row) => <span className="text-[13px] text-[var(--color-muted)]">{formatRelative(row.createdAt)}</span> },
    { key: "leadStatus", header: "Status", render: (row) => <LeadStatusBadge status={row.leadStatus} /> },
  ];

  // Client-side filter for the lead status tabs (mock store filters by `status`,
  // but leads use a dedicated `leadStatus` field).
  const rows = leadStatusFilter === "all" ? resource.items : resource.items.filter((l) => l.leadStatus === leadStatusFilter);

  return (
    <>
      <PageHeader
        title="Contact Leads"
        description="Enquiries submitted through the website contact form and product pages."
      />

      <Tabs tabs={TABS} value={resource.status} onChange={resource.setStatus} className="mb-4" />

      <Card className="overflow-hidden">
        <TableToolbar
          search={resource.search}
          onSearch={resource.setSearch}
          searchPlaceholder="Search leads…"
        />
        <DataTable<Lead>
          columns={columns}
          rows={rows}
          loading={resource.isLoading}
          showIndex
          startIndex={(resource.page - 1) * resource.pageSize}
          sortBy={resource.sort?.sortBy}
          sortDir={resource.sort?.sortDir}
          onSort={resource.toggleSort}
          rowActions={(row) => (
            <RowActionBar onView={() => setViewing(row)} onDelete={() => setDeleting(row)} />
          )}
          empty={{ icon: Inbox, title: "No leads here", description: "New enquiries will appear in this inbox." }}
        />
        {rows.length ? (
          <div className="border-t border-[var(--color-border)]">
            <Pagination page={resource.page} totalPages={resource.totalPages} total={resource.total} pageSize={resource.pageSize} onPageChange={resource.setPage} />
          </div>
        ) : null}
      </Card>

      {/* Lead detail */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.subject}
        description={viewing ? `From ${viewing.name} · ${formatRelative(viewing.createdAt)}` : undefined}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setViewing(null)}>
              Close
            </Button>
            {viewing ? (
              <Button href={`mailto:${viewing.email}`} leftIcon={<Mail className="size-4" />}>
                Reply by email
              </Button>
            ) : null}
          </>
        }
      >
        {viewing ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoRow icon={<Mail className="size-4" />} label="Email" value={viewing.email} />
              <InfoRow icon={<Phone className="size-4" />} label="Phone" value={viewing.phone} />
              <InfoRow icon={<Building2 className="size-4" />} label="Company" value={viewing.company} />
              <InfoRow icon={<Inbox className="size-4" />} label="Source" value={viewing.source} />
            </div>
            <div>
              <p className="mb-1.5 text-[13px] font-medium text-[var(--color-content)]">Message</p>
              <div className="rounded-[var(--radius-field)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 text-sm leading-relaxed text-[var(--color-content-soft)]">
                {viewing.message}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-[var(--radius-field)] border border-[var(--color-border)] p-3.5">
              <div>
                <p className="text-[13px] font-medium text-[var(--color-content)]">Lead status</p>
                <p className="text-[12px] text-[var(--color-muted)]">Track this enquiry through your pipeline</p>
              </div>
              <div className="w-40">
                <Select
                  value={viewing.leadStatus}
                  onChange={(e) => updateStatus(viewing, e.target.value as LeadStatus)}
                  options={STATUS_OPTIONS}
                />
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) {
            await crud.remove(deleting.id);
            setDeleting(null);
            resource.refetch();
          }
        }}
        title="Delete lead?"
        confirmLabel="Delete"
        loading={crud.busy}
      />
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
