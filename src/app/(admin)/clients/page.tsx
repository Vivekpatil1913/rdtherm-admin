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
    key: "imageUrl",
    header: "Logo",
    render: (row) => (
      <span className="flex size-16 items-center justify-center overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-white p-2">
        {row.imageUrl ? (
          <img src={row.imageUrl} alt={row.name} className="size-full object-contain" />
        ) : (
          <span className="text-[11px] font-bold text-[var(--color-muted)]">{row.name}</span>
        )}
      </span>
    ),
  },
  {
    key: "name",
    header: "Client",
    sortable: true,
    render: (row) => <p className="font-medium text-[var(--color-content)]">{row.name}</p>,
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
          <Field
            label="Logo image"
            hint="Square — recommended 400 × 400 px · transparent PNG / SVG · max 1 MB"
            error={errors.imageUrl}
            required
          >
            <ImageUpload value={values.imageUrl} onChange={(url) => setValue("imageUrl", url)} aspect="square" maxMb={1} className="max-w-[200px]" />
          </Field>
          <Field label="Client name" error={errors.name} required>
            <Input value={values.name} onChange={(e) => setValue("name", e.target.value)} invalid={!!errors.name} placeholder="KOBE Industries" />
          </Field>
        </>
      )}
    />
  );
}
