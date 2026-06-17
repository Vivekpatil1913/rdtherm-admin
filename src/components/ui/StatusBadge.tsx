import { Badge } from "./Badge";
import type { LeadStatus, QuoteStatus } from "@/types";

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
