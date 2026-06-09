"use client";

import { BriefcaseBusiness, MapPin } from "lucide-react";
import { ResourceManager } from "@/components/cms/ResourceManager";
import { Badge } from "@/components/ui/Badge";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { openingService } from "@/services";
import { rules } from "@/lib/validation";
import type { Column } from "@/components/data-table/DataTable";
import type { JobOpening } from "@/types";

type FormValues = {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

const DEPARTMENTS = ["Engineering", "Quality", "Fabrication", "Projects", "Supply Chain", "Sales", "HR & Admin"];
const TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

const columns: Column<JobOpening>[] = [
  {
    key: "title",
    header: "Position",
    sortable: true,
    render: (row) => (
      <div>
        <p className="font-medium text-[var(--color-content)]">{row.title}</p>
        <p className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-[var(--color-muted)]">
          <MapPin className="size-3" /> {row.location}
        </p>
      </div>
    ),
  },
  { key: "department", header: "Department", sortable: true, render: (row) => <Badge tone="brand">{row.department}</Badge> },
  { key: "type", header: "Type", render: (row) => <span className="text-[13px]">{row.type}</span> },
];

export default function CareersPage() {
  return (
    <ResourceManager<JobOpening, FormValues>
      title="Careers"
      description="Open job positions listed on the Careers page."
      singular="Opening"
      collection={openingService}
      columns={columns}
      searchPlaceholder="Search positions…"
      extraFilter={{ key: "department", options: DEPARTMENTS.map((d) => ({ value: d, label: d })) }}
      emptyValues={{ title: "", department: "Engineering", location: "Nashik, India", type: "Full-time", description: "" }}
      schema={{ title: [rules.required(), rules.minLength(4), rules.maxLength(50)], description: [rules.required(), rules.minLength(15), rules.maxLength(200)], location: [rules.required("Location is required"), rules.maxLength(100)] }}
      toForm={(row) => ({ title: row.title, department: row.department, location: row.location, type: row.type, description: row.description })}
      fromForm={(v) => ({ ...v, isActive: true, order: 0, createdAt: "", updatedAt: "" })}
      empty={{ icon: BriefcaseBusiness, title: "No open positions", description: "Post your first job opening." }}
      renderForm={({ values, errors, setValue }) => (
        <>
          <Field label="Job title" error={errors.title} required>
            <Input value={values.title} onChange={(e) => setValue("title", e.target.value)} invalid={!!errors.title} maxLength={50} showCount placeholder="Senior Mechanical Design Engineer" />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Department">
              <Select value={values.department} onChange={(e) => setValue("department", e.target.value)} options={DEPARTMENTS.map((d) => ({ value: d, label: d }))} />
            </Field>
            <Field label="Location" error={errors.location} required>
              <Input value={values.location} onChange={(e) => setValue("location", e.target.value)} invalid={!!errors.location} maxLength={100} placeholder="Nashik, India" />
            </Field>
            <Field label="Type">
              <Select value={values.type} onChange={(e) => setValue("type", e.target.value)} options={TYPES.map((t) => ({ value: t, label: t }))} />
            </Field>
          </div>
          <Field label="Description" error={errors.description} required>
            <Textarea value={values.description} onChange={(e) => setValue("description", e.target.value)} invalid={!!errors.description} rows={4} maxLength={200} showCount />
          </Field>
        </>
      )}
    />
  );
}
