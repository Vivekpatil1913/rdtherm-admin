"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import { ResourceManager } from "@/components/cms/ResourceManager";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ImageUpload } from "@/components/form/ImageUpload";
import { logoService, caseStudyService } from "@/services";
import { rules, type Rule } from "@/lib/validation";
import type { Column } from "@/components/data-table/DataTable";
import type { CaseStudy, Logo } from "@/types";

/**
 * Sentinel for "not linked to a case study". The API accepts "" or "none"; a
 * <select> cannot hold null, so the form carries this string and `fromForm`
 * passes it straight through.
 */
const NO_CASE_STUDY = "none";

type FormValues = {
  name: string;
  imageUrl: string;
  /** Case study id, or NO_CASE_STUDY for a logo that stays unclickable. */
  caseStudyId: string;
};

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
  {
    key: "caseStudyId",
    header: "Links to",
    width: "w-56",
    render: (row) =>
      row.caseStudyId ? (
        <span className="inline-flex rounded-full bg-[var(--color-brand)]/10 px-2.5 py-1 text-[12px] font-medium text-[var(--color-brand-strong)]">
          {row.caseStudyTitle ?? "Unknown case study"}
        </span>
      ) : (
        <span className="text-[12px] text-[var(--color-muted)]">Not clickable</span>
      ),
  },
];

export default function ClientsPage() {
  // The picker needs every live case study — a small, stable list.
  const [studies, setStudies] = useState<CaseStudy[]>([]);

  useEffect(() => {
    let cancelled = false;
    caseStudyService
      .list({ page: 1, pageSize: 100, sortBy: "order", sortDir: "asc" })
      .then((res) => {
        if (!cancelled) setStudies(res.items);
      })
      .catch(() => {
        // A failed load leaves the picker on "No case study", which is a safe
        // default. Never block saving a logo on it.
        if (!cancelled) setStudies([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo(
    () => [
      { value: NO_CASE_STUDY, label: "No case study (logo not clickable)" },
      ...studies.map((s) => ({ value: s.id, label: `${s.client} — ${s.title}` })),
    ],
    [studies],
  );

  /** Reject an id that is not one of the loaded case studies (or the sentinel). */
  const caseStudyExists: Rule = (value) => {
    const id = String(value ?? "");
    if (id === NO_CASE_STUDY) return null;
    if (!studies.length) return null; // list never loaded — let the API decide
    return studies.some((s) => s.id === id) ? null : "Please choose a case study from the list";
  };

  return (
    <ResourceManager<Logo, FormValues>
      title="Client Logos"
      description="Logos shown in the 'Trusted by' homepage marquee. Link one to a case study to make it clickable."
      singular="Logo"
      collection={logoService}
      columns={columns}
      searchPlaceholder="Search clients…"
      baseFilters={{ kind: "client" }}
      modalSize="md"
      emptyValues={{ name: "", imageUrl: "", caseStudyId: NO_CASE_STUDY }}
      schema={{
        name: [rules.required("Please enter the client name")],
        imageUrl: [rules.required("Please upload a logo image")],
        caseStudyId: [rules.required("Please choose a case study, or 'No case study'"), caseStudyExists],
      }}
      toForm={(row) => ({
        name: row.name,
        imageUrl: row.imageUrl ?? "",
        caseStudyId: row.caseStudyId ?? NO_CASE_STUDY,
      })}
      fromForm={(v) =>
        ({
          name: v.name,
          imageUrl: v.imageUrl,
          // NO_CASE_STUDY is the API's own sentinel for an unlinked logo.
          caseStudyId: v.caseStudyId,
          kind: "client" as const,
          isActive: true,
          order: 0,
          createdAt: "",
          updatedAt: "",
        }) as unknown as Omit<Logo, "id">
      }
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
          <Field
            label="Case study"
            error={errors.caseStudyId}
            required
            hint="Linked logos open that case study from the homepage marquee. An unlinked logo stays a plain trust mark."
          >
            <Select
              options={options}
              value={values.caseStudyId}
              onChange={(e) => setValue("caseStudyId", e.target.value)}
              invalid={!!errors.caseStudyId}
            />
          </Field>
        </>
      )}
    />
  );
}
