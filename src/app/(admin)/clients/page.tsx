"use client";

/* eslint-disable @next/next/no-img-element */
import { Building2 } from "lucide-react";
import { ResourceManager } from "@/components/cms/ResourceManager";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/form/ImageUpload";
import { logoService } from "@/services";
import { rules } from "@/lib/validation";
import type { Column } from "@/components/data-table/DataTable";
import type { Logo } from "@/types";

type FormValues = {
  name: string;
  imageUrl: string;
}

const columns: Column<Logo>[] = [
  {
    key: "name",
    header: "Client",
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-16 items-center justify-center overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
          {row.imageUrl ? (
            <img src={row.imageUrl} alt={row.name} className="max-h-7 max-w-14 object-contain" />
          ) : (
            <span className="text-[11px] font-bold text-[var(--color-muted)]">{row.name}</span>
          )}
        </span>
        <p className="font-medium text-[var(--color-content)]">{row.name}</p>
      </div>
    ),
  },
];

export default function ClientsPage() {
  return (
    <ResourceManager<Logo, FormValues>
      title="Client Logos"
      description="Logos shown in the 'Trusted by' homepage marquee."
      singular="Logo"
      collection={logoService}
      columns={columns}
      searchPlaceholder="Search clients…"
      baseFilters={{ kind: "client" }}
      modalSize="md"
      emptyValues={{ name: "", imageUrl: "" }}
      schema={{
        name: [rules.required("Please enter the client name")],
        imageUrl: [rules.required("Please upload a logo image")],
      }}
      toForm={(row) => ({ name: row.name, imageUrl: row.imageUrl ?? "" })}
      fromForm={(v) => ({ ...v, kind: "client" as const, isActive: true, order: 0, createdAt: "", updatedAt: "" })}
      empty={{ icon: Building2, title: "No client logos", description: "Add a client logo." }}
      renderForm={({ values, errors, setValue }) => (
        <>
          <Field label="Logo image" hint="Transparent PNG / SVG works best" error={errors.imageUrl} required>
            <ImageUpload value={values.imageUrl} onChange={(url) => setValue("imageUrl", url)} aspect="video" className="max-w-xs" />
          </Field>
          <Field label="Client name" error={errors.name} required>
            <Input value={values.name} onChange={(e) => setValue("name", e.target.value)} invalid={!!errors.name} placeholder="KOBE Industries" />
          </Field>
        </>
      )}
    />
  );
}
