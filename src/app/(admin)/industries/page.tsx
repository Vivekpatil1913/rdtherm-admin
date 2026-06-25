"use client";

/* eslint-disable @next/next/no-img-element */
import { Factory } from "lucide-react";
import { ResourceManager } from "@/components/cms/ResourceManager";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ImageUpload } from "@/components/form/ImageUpload";
import { IMAGE_PRESETS } from "@/lib/image";
import { industryService } from "@/services";
import { rules } from "@/lib/validation";
import { slugify, truncate } from "@/lib/format";
import type { Column } from "@/components/data-table/DataTable";
import type { Industry } from "@/types";

type FormValues = {
  label: string;
  key: string;
  description: string;
  cover: string;
}

const columns: Column<Industry>[] = [
  {
    key: "label",
    header: "Industry",
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-3">
        <img src={row.cover} alt="" className="size-11 rounded-lg object-cover" />
        <div>
          <p className="font-medium text-[var(--color-content)]">{row.label}</p>
          <p className="text-[12px] text-[var(--color-muted)]">{row.key}</p>
        </div>
      </div>
    ),
  },
  { key: "description", header: "Description", render: (row) => <p className="max-w-lg text-[13px]">{truncate(row.description, 110)}</p> },
];

export default function IndustriesPage() {
  return (
    <ResourceManager<Industry, FormValues>
      title="Industries"
      description="Industry sectors shown in the 'Industries We Serve' homepage section."
      singular="Industry"
      collection={industryService}
      columns={columns}
      searchPlaceholder="Search industries…"
      emptyValues={{ label: "", key: "", description: "", cover: "" }}
      schema={{ label: [rules.required("Please enter the industry name"), rules.maxLength(50)], description: [rules.required("Please enter the description"), rules.minLength(20), rules.maxLength(300)], cover: [rules.required("Please upload a cover image")] }}
      toForm={(row) => ({ label: row.label, key: row.key, description: row.description, cover: row.cover })}
      fromForm={(v) => ({ ...v, key: v.key || slugify(v.label), isActive: true, order: 0, createdAt: "", updatedAt: "" })}
      empty={{ icon: Factory, title: "No industries yet", description: "Add the first industry sector." }}
      renderForm={({ values, errors, setValue }) => (
        <>
          <Field label="Industry name" error={errors.label} required count={values.label.length} max={50}>
            <Input value={values.label} onChange={(e) => setValue("label", e.target.value)} invalid={!!errors.label} maxLength={50} placeholder="Chemical and Petrochemical" />
          </Field>
          <Field label="Description" error={errors.description} required count={values.description.length} max={300}>
            <Textarea value={values.description} onChange={(e) => setValue("description", e.target.value)} invalid={!!errors.description} rows={3} maxLength={300} />
          </Field>
          <Field label="Cover image" error={errors.cover} required>
            <ImageUpload value={values.cover} onChange={(url) => setValue("cover", url)} aspect="video" preset={IMAGE_PRESETS.industryCover} />
          </Field>
        </>
      )}
    />
  );
}
