import { Badge } from "./Badge";
import type { LeadStatus, QuoteStatus, ApplicationStatus } from "@/types";

const LEAD_TONE = {
  new: "info",
  "in-progress": "warning",
  qualified: "brand",
  closed: "neutral",
} as const;

const LEAD_LABEL = {
  new: "New",
  "in-progress": "In progress",
  qualified: "Qualified",
  closed: "Closed",
} as const;

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge tone={LEAD_TONE[status]} dot>
      {LEAD_LABEL[status]}
    </Badge>
  );
}

const QUOTE_TONE = {
  new: "info",
  "in-progress": "warning",
  quoted: "brand",
  closed: "neutral",
} as const;

const QUOTE_LABEL = {
  new: "New",
  "in-progress": "In progress",
  quoted: "Quoted",
  closed: "Closed",
} as const;

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <Badge tone={QUOTE_TONE[status]} dot>
      {QUOTE_LABEL[status]}
    </Badge>
  );
}

const APP_TONE = {
  new: "info",
  reviewing: "warning",
  shortlisted: "brand",
  rejected: "neutral",
} as const;

const APP_LABEL = {
  new: "New",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
} as const;

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <Badge tone={APP_TONE[status]} dot>
      {APP_LABEL[status]}
    </Badge>
  );
}
