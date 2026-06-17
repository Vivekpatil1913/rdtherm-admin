"use client";

import { Quote, Star } from "lucide-react";
import { ResourceManager } from "@/components/cms/ResourceManager";
import { Avatar } from "@/components/ui/Avatar";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ImageUpload } from "@/components/form/ImageUpload";
import { IMAGE_PRESETS } from "@/lib/image";
import { testimonialService } from "@/services";
import { rules } from "@/lib/validation";
import { truncate } from "@/lib/format";
import type { Column } from "@/components/data-table/DataTable";
import type { Testimonial } from "@/types";

type FormValues = {
  author: string;
  role: string;
  body: string;
  rating: number;
  avatarUrl: string;
}

const columns: Column<Testimonial>[] = [
  {
    key: "author",
    header: "Author",
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.author} src={row.avatarUrl} size="sm" />
        <div>
          <p className="font-medium text-[var(--color-content)]">{row.author}</p>
          <p className="text-[12px] text-[var(--color-muted)]">{row.role}</p>
        </div>
      </div>
    ),
  },
  {
    key: "body",
    header: "Testimonial",
    render: (row) => <p className="max-w-md text-[13px]">{truncate(row.body, 110)}</p>,
  },
  {
    key: "rating",
    header: "Rating",
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={
              i < row.rating
                ? "size-3.5 fill-[var(--color-warning)] text-[var(--color-warning)]"
                : "size-3.5 text-[var(--color-border-strong)]"
            }
          />
        ))}
      </div>
    ),
  },
];

export default function TestimonialsPage() {
  return (
    <ResourceManager<Testimonial, FormValues>
      title="Testimonials"
      description="Client quotes shown on the homepage testimonials carousel."
      singular="Testimonial"
      collection={testimonialService}
      columns={columns}
      searchPlaceholder="Search by author or quote…"
      emptyValues={{ author: "", role: "", body: "", rating: 5, avatarUrl: "" }}
      schema={{
        author: [rules.required("Please enter the author name"), rules.minLength(2), rules.alpha(), rules.maxLength(50)],
        role: [rules.required("Please enter the role / company"), rules.maxLength(50)],
        body: [rules.required("Please enter the testimonial"), rules.minLength(20), rules.maxLength(300)],
        avatarUrl: [rules.required("Please upload an avatar")],
      }}
      toForm={(row) => ({
        author: row.author,
        role: row.role,
        body: row.body,
        rating: row.rating,
        avatarUrl: row.avatarUrl ?? "",
      })}
      fromForm={(v) => ({
        author: v.author,
        role: v.role,
        body: v.body,
        rating: Number(v.rating),
        avatarUrl: v.avatarUrl,
        isActive: true,
        order: 0,
        createdAt: "",
        updatedAt: "",
      })}
      empty={{ icon: Quote, title: "No testimonials yet", description: "Add your first client testimonial." }}
      renderForm={({ values, errors, setValue }) => (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Author name" error={errors.author} required count={values.author.length} max={50}>
              <Input value={values.author} onChange={(e) => setValue("author", e.target.value)} invalid={!!errors.author} maxLength={50} placeholder="Emily Carter" />
            </Field>
            <Field label="Role / Company" error={errors.role} required count={values.role.length} max={50}>
              <Input value={values.role} onChange={(e) => setValue("role", e.target.value)} invalid={!!errors.role} maxLength={50} placeholder="Process Engineering Lead" />
            </Field>
          </div>
          <Field label="Testimonial" error={errors.body} required count={values.body.length} max={300}>
            <Textarea value={values.body} onChange={(e) => setValue("body", e.target.value)} invalid={!!errors.body} rows={4} maxLength={300} placeholder="What the client said…" />
          </Field>
          <Field label="Rating">
            <Select
              value={String(values.rating)}
              onChange={(e) => setValue("rating", Number(e.target.value))}
              options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} star${n > 1 ? "s" : ""}` }))}
            />
          </Field>
          <Field label="Avatar" error={errors.avatarUrl} required>
            <ImageUpload value={values.avatarUrl} onChange={(url) => setValue("avatarUrl", url)} aspect="square" className="max-w-[160px]" preset={IMAGE_PRESETS.avatar} />
          </Field>
        </>
      )}
    />
  );
}
