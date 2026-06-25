"use client";

import { useEffect, useState } from "react";
import { Inbox, Mail, Phone, Briefcase, Link2, FileText, Download, MessageSquareText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ApplicationStatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { TableToolbar } from "@/components/data-table/TableToolbar";
import { RowActionBar } from "@/components/data-table/RowActionBar";
import { useResource } from "@/hooks/useResource";
import { useCrud } from "@/hooks/useCrud";
import { applicationService } from "@/services";
import { useToast } from "@/providers/ToastProvider";
import { errorMessage } from "@/services/apiError";
import { formatRelative } from "@/lib/format";
import type { JobApplication, ApplicationStatus } from "@/types";

// Forward-only pipeline order.
const STAGES: ApplicationStatus[] = ["new", "reviewing", "shortlisted", "rejected"];
const FEEDBACK_LIMIT = 150;

const TABS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
];

export default function ApplicationsPage() {
  const resource = useResource<JobApplication>(applicationService, { initialSort: { sortBy: "createdAt", sortDir: "desc" } });
  const crud = useCrud(applicationService, "Job application");
  const toast = useToast();
  const [viewing, setViewing] = useState<JobApplication | null>(null);
  const [deleting, setDeleting] = useState<JobApplication | null>(null);
  // Reject flow: selecting "Rejected" reveals a required feedback box before saving.
  const [draftStatus, setDraftStatus] = useState<ApplicationStatus | null>(null);
  const [feedback, setFeedback] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  // Reset the reject-draft whenever a different application is opened/closed.
  useEffect(() => {
    setDraftStatus(null);
    setFeedback("");
  }, [viewing?.id]);

  // List omits the heavy message field — fetch the full record for the detail view.
  const openView = async (row: JobApplication) => {
    setViewing(row);
    const full = await applicationService.get(row.id);
    if (full) setViewing(full);
  };

  // Forward-only options: only the current stage and everything after it.
  const forwardOptions = (current: ApplicationStatus) =>
    STAGES.slice(STAGES.indexOf(current)).map((s) => ({
      value: s,
      label: STATUS_OPTIONS.find((o) => o.value === s)!.label,
    }));

  const updateStatus = async (app: JobApplication, appStatus: ApplicationStatus, feedbackText?: string) => {
    if (savingStatus) return;
    setSavingStatus(true);
    try {
      const patch = appStatus === "rejected" ? { appStatus, feedback: feedbackText } : { appStatus };
      await applicationService.update(app.id, patch);
      setViewing((v) =>
        v ? { ...v, appStatus, ...(appStatus === "rejected" ? { feedback: feedbackText } : {}) } : v,
      );
      toast.success("Application updated", `Marked as ${appStatus}.`);
      setDraftStatus(null);
      setFeedback("");
      resource.refetch();
      window.dispatchEvent(new Event("rdtherm:stats"));
    } catch (err) {
      toast.error("Could not update application", errorMessage(err));
    } finally {
      setSavingStatus(false);
    }
  };

  const columns: Column<JobApplication>[] = [
    {
      key: "name",
      header: "Applicant",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--color-content)]">{row.name}</p>
          <p className="text-[12px] text-[var(--color-muted)]">{row.email}</p>
        </div>
      ),
    },
    { key: "role", header: "Role", render: (row) => <span className="text-[13px]">{row.role}</span> },
    { key: "phone", header: "Phone", render: (row) => <span className="text-[13px] text-[var(--color-muted)]">{row.phone || "—"}</span> },
    { key: "createdAt", header: "Received", sortable: true, render: (row) => <span className="text-[13px] text-[var(--color-muted)]">{formatRelative(row.createdAt)}</span> },
    { key: "appStatus", header: "Status", render: (row) => <ApplicationStatusBadge status={row.appStatus} /> },
  ];

  return (
    <>
      <PageHeader
        title="Job Applications"
        description="Applications submitted through the Careers page, with the uploaded resume."
      />

      <Tabs tabs={TABS} value={resource.status} onChange={resource.setStatus} className="mb-4" />

      <Card className="overflow-hidden">
        <TableToolbar
          search={resource.search}
          onSearch={resource.setSearch}
          searchPlaceholder="Search by name, email, role or phone…"
        />
        <DataTable<JobApplication>
          columns={columns}
          rows={resource.items}
          loading={resource.isLoading}
          showIndex
          startIndex={(resource.page - 1) * resource.pageSize}
          sortBy={resource.sort?.sortBy}
          sortDir={resource.sort?.sortDir}
          onSort={resource.toggleSort}
          rowActions={(row) => (
            <RowActionBar onView={() => openView(row)} onDelete={() => setDeleting(row)} />
          )}
          empty={{ icon: Inbox, title: "No applications yet", description: "Applications from the Careers page will appear here." }}
        />
        {resource.items.length ? (
          <div className="border-t border-[var(--color-border)]">
            <Pagination page={resource.page} totalPages={resource.totalPages} total={resource.total} pageSize={resource.pageSize} onPageChange={resource.setPage} />
          </div>
        ) : null}
      </Card>

      {/* Application detail */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing ? `${viewing.name} — ${viewing.role}` : undefined}
        description={viewing ? `Applied ${formatRelative(viewing.createdAt)}` : undefined}
        size="lg"
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
              <InfoRow icon={<Phone className="size-4" />} label="Phone" value={viewing.phone || "—"} />
              <InfoRow icon={<Briefcase className="size-4" />} label="Role" value={viewing.role} />
              <InfoRow icon={<Inbox className="size-4" />} label="Source" value={viewing.source} />
            </div>

            {viewing.portfolio ? (
              <InfoRow
                icon={<Link2 className="size-4" />}
                label="Portfolio / LinkedIn"
                value={
                  <a href={viewing.portfolio} target="_blank" rel="noopener noreferrer" className="text-[var(--color-brand-strong)] hover:underline">
                    {viewing.portfolio}
                  </a>
                }
              />
            ) : null}

            {/* Resume — open / download */}
            <div className="flex items-center justify-between gap-3 rounded-[var(--radius-field)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-field)] bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)]">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[var(--color-content)]">Resume</p>
                  <p className="truncate text-[12px] text-[var(--color-muted)]">{viewing.resumeName || "Attached file"}</p>
                </div>
              </div>
              <a
                href={viewing.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[var(--radius-field)] bg-[var(--color-brand-strong)] px-3.5 text-[13px] font-medium text-white transition-colors hover:opacity-90"
              >
                <Download className="size-4" /> Open resume
              </a>
            </div>

            {viewing.message ? (
              <div>
                <p className="mb-1.5 text-[13px] font-medium text-[var(--color-content)]">Message</p>
                <div className="rounded-[var(--radius-field)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 text-sm leading-relaxed text-[var(--color-content-soft)] whitespace-pre-wrap">
                  {viewing.message}
                </div>
              </div>
            ) : null}

            {/* Existing rejection feedback (terminal stage) */}
            {viewing.appStatus === "rejected" && viewing.feedback ? (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-content)]">
                  <MessageSquareText className="size-4 text-[var(--color-muted)]" /> Rejection feedback
                </p>
                <div className="rounded-[var(--radius-field)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 text-sm leading-relaxed text-[var(--color-content-soft)] whitespace-pre-wrap">
                  {viewing.feedback}
                </div>
              </div>
            ) : null}

            <div className="rounded-[var(--radius-field)] border border-[var(--color-border)] p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-medium text-[var(--color-content)]">Application status</p>
                  <p className="text-[12px] text-[var(--color-muted)]">
                    {viewing.appStatus === "rejected"
                      ? "This application is rejected — the pipeline stage is final."
                      : "Status can only move forward through the pipeline."}
                  </p>
                </div>
                <div className="w-40">
                  <Select
                    value={draftStatus ?? viewing.appStatus}
                    disabled={viewing.appStatus === "rejected" || savingStatus}
                    onChange={(e) => {
                      const next = e.target.value as ApplicationStatus;
                      if (next === viewing.appStatus) return;
                      if (next === "rejected") {
                        setDraftStatus("rejected"); // reveal feedback box; persist on confirm
                      } else {
                        setDraftStatus(null);
                        updateStatus(viewing, next);
                      }
                    }}
                    options={forwardOptions(viewing.appStatus)}
                  />
                </div>
              </div>

              {/* Required feedback before rejecting */}
              {draftStatus === "rejected" && viewing.appStatus !== "rejected" ? (
                <div className="mt-3.5 border-t border-[var(--color-border)] pt-3.5">
                  <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-content)]">
                    Why are you rejecting this candidate? <span className="text-[var(--color-danger)]">*</span>
                  </label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value.slice(0, FEEDBACK_LIMIT))}
                    maxLength={FEEDBACK_LIMIT}
                    rows={3}
                    placeholder="e.g. Not enough pressure-vessel experience / Role filled / Location mismatch…"
                  />
                  <div className="mt-1 flex items-center justify-end">
                    <span
                      className={
                        "text-[11px] font-medium tabular-nums " +
                        (feedback.length >= FEEDBACK_LIMIT ? "text-[var(--color-danger)]" : "text-[var(--color-muted)]")
                      }
                    >
                      {feedback.length}/{FEEDBACK_LIMIT}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDraftStatus(null);
                        setFeedback("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={savingStatus}
                      disabled={!feedback.trim()}
                      onClick={() => updateStatus(viewing, "rejected", feedback.trim())}
                    >
                      Reject candidate
                    </Button>
                  </div>
                </div>
              ) : null}
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
        title="Delete application?"
        confirmLabel="Delete"
        loading={crud.busy}
      />
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
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
