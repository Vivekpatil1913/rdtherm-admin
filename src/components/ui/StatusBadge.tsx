import { Badge } from "./Badge";
import type { LeadStatus } from "@/types";

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
