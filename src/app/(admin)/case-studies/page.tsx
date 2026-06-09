"use client";

/* eslint-disable @next/next/no-img-element */
import { Trophy } from "lucide-react";
import { ResourceManager } from "@/components/cms/ResourceManager";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ImageUpload } from "@/components/form/ImageUpload";
import { caseStudyService } from "@/services";
import { rules } from "@/lib/validation";
import { slugify, truncate } from "@/lib/format";
import type { Column } from "@/components/data-table/DataTable";
import type { CaseStudy } from "@/types";

type FormValues = {
  title: string;
  client: string;
  industry: string;
  summary: string;
  cover: string;
  content: string;
}

const columns: Column<CaseStudy>[] = [
  {
    key: "title",
    header: "Case Study",
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-3">
        <img src={row.cover} alt="" className="h-12 w-16 shrink-0 rounded-md object-cover" />
        <div className="min-w-0">
          <p className="truncate font-medium text-[var(--color-content)]">{row.title}</p>
          <p className="truncate text-[12px] text-[var(--color-muted)]">{row.client} · {row.industry}</p>
        </div>
      </div>
    ),
  },
  { key: "summary", header: "Summary", render: (row) => <p className="max-w-md text-[13px]">{truncate(row.summary, 90)}</p> },
];

export default function CaseStudiesPage() {
  return (
    <ResourceManager<CaseStudy, FormValues>
      title="Case Studies"
      description="Success stories highlighting delivered projects and outcomes."
      singular="Case Study"
      collection={caseStudyService}
      columns={columns}
      searchPlaceholder="Search case studies…"
      emptyValues={{ title: "", client: "", industry: "Chemical & Petrochemical", summary: "", cover: "", content: "" }}
      schema={{ title: [rules.required(), rules.minLength(6), rules.maxLength(50)], client: [rules.required(), rules.maxLength(50)], industry: [rules.required(), rules.maxLength(50)], summary: [rules.required(), rules.minLength(20), rules.maxLength(300)], cover: [rules.required("A cover image is required")] }}
      toForm={(row) => ({ title: row.title, client: row.client, industry: row.industry, summary: row.summary, cover: row.cover, content: row.content })}
      fromForm={(v) => ({ ...v, slug: slugify(v.title), metrics: [], isActive: true, order: 0, createdAt: "", updatedAt: "" })}
      empty={{ icon: Trophy, title: "No case studies yet", description: "Add your first project success story." }}
      renderForm={({ values, errors, setValue }) => (
        <>
          <Field label="Cover image" error={errors.cover} required>
            <ImageUpload value={values.cover} onChange={(url) => setValue("cover", url)} aspect="video" />
          </Field>
          <Field label="Title" error={errors.title} required>
            <Input value={values.title} onChange={(e) => setValue("title", e.target.value)} invalid={!!errors.title} maxLength={50} showCount placeholder="48.5 MT distillation column delivered early" />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Client" error={errors.client} required>
              <Input value={values.client} onChange={(e) => setValue("client", e.target.value)} invalid={!!errors.client} maxLength={50} showCount placeholder="Specialty Chemicals EPC" />
            </Field>
            <Field label="Industry" error={errors.industry} required>
              <Input value={values.industry} onChange={(e) => setValue("industry", e.target.value)} invalid={!!errors.industry} maxLength={50} showCount placeholder="Chemical & Petrochemical" />
            </Field>
          </div>
          <Field label="Summary" error={errors.summary} required>
            <Textarea value={values.summary} onChange={(e) => setValue("summary", e.target.value)} invalid={!!errors.summary} rows={3} maxLength={300} showCount />
          </Field>
        </>
      )}
    />
  );
}
