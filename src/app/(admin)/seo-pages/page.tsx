"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { ResourceManager } from "@/components/cms/ResourceManager";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/form/TagInput";
import { ImageUpload } from "@/components/form/ImageUpload";
import {
  seoPageService,
  productService,
  industryService,
  caseStudyService,
} from "@/services";
import { rules, type Rule } from "@/lib/validation";
import { slugify } from "@/lib/format";
import type { Column } from "@/components/data-table/DataTable";
import type { CaseStudy, Industry, Product, SeoFaq, SeoPage, SeoSection } from "@/types";

/**
 * Service + location landing pages (/pressure-vessel-manufacturer-nashik and
 * the like). The website renders one fixed template from these fields, so the
 * SEO team can publish a new location page without a code change.
 *
 * Industries, products and case studies are picked from existing records rather
 * than typed in, which is what stops a landing page claiming something the
 * business doesn't actually offer.
 */

type FormValues = {
  slug: string;
  name: string;
  primaryKeyword: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  heroDescription: string;
  heroImageUrl: string;
  heroImageAlt: string;
  sections: SeoSection[];
  industryKeys: string[];
  productSlugs: string[];
  caseStudySlugs: string[];
  faqs: SeoFaq[];
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  canonicalUrl: string;
};

const EMPTY: FormValues = {
  slug: "",
  name: "",
  primaryKeyword: "",
  seoTitle: "",
  metaDescription: "",
  h1: "",
  heroDescription: "",
  heroImageUrl: "",
  heroImageAlt: "",
  sections: [],
  industryKeys: [],
  productSlugs: [],
  caseStudySlugs: [],
  faqs: [],
  ogTitle: "",
  ogDescription: "",
  ogImageUrl: "",
  canonicalUrl: "",
};

const columns: Column<SeoPage>[] = [
  {
    key: "name",
    header: "Page",
    sortable: true,
    render: (row) => (
      <div>
        <p className="font-medium text-[var(--color-content)]">{row.name}</p>
        <p className="mt-0.5 text-[12px] text-[var(--color-muted)]">/{row.slug}</p>
      </div>
    ),
  },
  {
    key: "primaryKeyword",
    header: "Primary keyword",
    width: "w-72",
    render: (row) => (
      <span className="text-[13px] text-[var(--color-muted)]">{row.primaryKeyword}</span>
    ),
  },
];

/** Length counter that also warns past the limit search engines actually use. */
const lengthHint = (value: string, min: number, max: number) =>
  `${value.length} / ${max} characters${value.length < min ? ` — at least ${min}` : ""}`;

export default function SeoPagesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);

  useEffect(() => {
    let cancelled = false;
    const params = { page: 1, pageSize: 100, sortBy: "order", sortDir: "asc" as const };
    Promise.all([
      productService.list(params).catch(() => ({ items: [] as Product[] })),
      industryService.list(params).catch(() => ({ items: [] as Industry[] })),
      caseStudyService.list(params).catch(() => ({ items: [] as CaseStudy[] })),
    ]).then(([p, i, c]) => {
      if (cancelled) return;
      setProducts(p.items);
      setIndustries(i.items);
      setCaseStudies(c.items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /** The slug becomes a URL, so reject anything that isn't URL-safe. */
  const validSlug: Rule = (value) => {
    const v = String(value ?? "").trim();
    if (!v) return null; // `required` reports the empty case
    return v === slugify(v) ? null : "Use lowercase letters, numbers and hyphens only";
  };

  return (
    <ResourceManager<SeoPage, FormValues>
      title="SEO Landing Pages"
      description="Service + location landing pages, published at the site root. Add a page here and it appears on the website, in the footer and in the sitemap."
      singular="SEO Page"
      collection={seoPageService}
      columns={columns}
      searchPlaceholder="Search pages…"
      modalSize="xl"
      emptyValues={EMPTY}
      schema={{
        name: [rules.required("Please enter an internal page name"), rules.maxLength(190)],
        slug: [rules.required("Please enter the URL slug"), validSlug, rules.maxLength(190)],
        primaryKeyword: [rules.required("Please enter the primary keyword")],
        seoTitle: [
          rules.required("Please enter the SEO title"),
          rules.minLength(10),
          rules.maxLength(70),
        ],
        metaDescription: [
          rules.required("Please enter the meta description"),
          rules.minLength(50),
          rules.maxLength(160),
        ],
        h1: [rules.required("Please enter the H1"), rules.maxLength(255)],
        heroDescription: [
          rules.required("Please enter the hero description"),
          rules.minLength(20),
          rules.maxLength(600),
        ],
      }}
      toForm={(row) => ({
        slug: row.slug,
        name: row.name,
        primaryKeyword: row.primaryKeyword,
        seoTitle: row.seoTitle,
        metaDescription: row.metaDescription,
        h1: row.h1,
        heroDescription: row.heroDescription,
        heroImageUrl: row.heroImageUrl ?? "",
        heroImageAlt: row.heroImageAlt ?? "",
        sections: row.sections ?? [],
        industryKeys: row.industryKeys ?? [],
        productSlugs: row.productSlugs ?? [],
        caseStudySlugs: row.caseStudySlugs ?? [],
        faqs: row.faqs ?? [],
        ogTitle: row.ogTitle ?? "",
        ogDescription: row.ogDescription ?? "",
        ogImageUrl: row.ogImageUrl ?? "",
        canonicalUrl: row.canonicalUrl ?? "",
      })}
      fromForm={(v) =>
        ({
          ...v,
          slug: slugify(v.slug),
          isActive: true,
          order: 0,
          createdAt: "",
          updatedAt: "",
        }) as unknown as Omit<SeoPage, "id">
      }
      empty={{
        icon: Search,
        title: "No landing pages yet",
        description: "Create a service + location page, e.g. Pressure Vessel Manufacturer in Nashik.",
      }}
      renderForm={({ values, errors, setValue }) => {
        const setSection = (i: number, patch: Partial<SeoSection>) =>
          setValue(
            "sections",
            values.sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
          );
        const setFaq = (i: number, patch: Partial<SeoFaq>) =>
          setValue(
            "faqs",
            values.faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
          );
        const toggle = (
          key: "industryKeys" | "productSlugs" | "caseStudySlugs",
          id: string,
        ) =>
          setValue(
            key,
            values[key].includes(id) ? values[key].filter((x) => x !== id) : [...values[key], id],
          );

        const CheckList = ({
          label,
          hint,
          field,
          options,
        }: {
          label: string;
          hint: string;
          field: "industryKeys" | "productSlugs" | "caseStudySlugs";
          options: { id: string; label: string }[];
        }) => (
          <Field label={label} hint={hint} optional>
            {options.length === 0 ? (
              <p className="text-[13px] text-[var(--color-muted)]">Nothing available yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => {
                  const on = values[field].includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggle(field, opt.id)}
                      aria-pressed={on}
                      className={
                        "rounded-full border px-3 py-1.5 text-[13px] transition-colors " +
                        (on
                          ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-brand-strong)]"
                          : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-border-strong)]")
                      }
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </Field>
        );

        return (
          <div className="flex flex-col gap-5">
            {/* ── Identity ─────────────────────────────── */}
            <Field label="Page name" hint="Internal label only — never shown on the website." error={errors.name} required>
              <Input
                value={values.name}
                onChange={(e) => setValue("name", e.target.value)}
                invalid={!!errors.name}
                placeholder="Pressure Vessel Manufacturer — Nashik"
              />
            </Field>

            <Field label="URL slug" hint={`Live page: /${slugify(values.slug) || "…"}`} error={errors.slug} required>
              <Input
                value={values.slug}
                onChange={(e) => setValue("slug", e.target.value)}
                onBlur={(e) => setValue("slug", slugify(e.target.value))}
                invalid={!!errors.slug}
                placeholder="pressure-vessel-manufacturer-nashik"
              />
            </Field>

            <Field label="Primary keyword" hint="The one search term this page targets." error={errors.primaryKeyword} required>
              <Input
                value={values.primaryKeyword}
                onChange={(e) => setValue("primaryKeyword", e.target.value)}
                invalid={!!errors.primaryKeyword}
                placeholder="pressure vessel manufacturer Nashik"
              />
            </Field>

            {/* ── Search metadata ──────────────────────── */}
            <Field
              label="SEO title"
              hint={lengthHint(values.seoTitle, 10, 70)}
              error={errors.seoTitle}
              required
            >
              <Input
                value={values.seoTitle}
                onChange={(e) => setValue("seoTitle", e.target.value)}
                invalid={!!errors.seoTitle}
                maxLength={70}
                placeholder="Pressure Vessel Manufacturer in Nashik | R&D Therm"
              />
            </Field>

            <Field
              label="Meta description"
              hint={lengthHint(values.metaDescription, 50, 160)}
              error={errors.metaDescription}
              required
            >
              <Textarea
                value={values.metaDescription}
                onChange={(e) => setValue("metaDescription", e.target.value)}
                invalid={!!errors.metaDescription}
                maxLength={160}
                rows={3}
              />
            </Field>

            {/* ── Hero ─────────────────────────────────── */}
            <Field label="H1" hint="The one visible headline on the page." error={errors.h1} required>
              <Input
                value={values.h1}
                onChange={(e) => setValue("h1", e.target.value)}
                invalid={!!errors.h1}
                placeholder="Pressure Vessel Manufacturer in Nashik"
              />
            </Field>

            <Field label="Hero description" error={errors.heroDescription} required count={values.heroDescription.length} max={600}>
              <Textarea
                value={values.heroDescription}
                onChange={(e) => setValue("heroDescription", e.target.value)}
                invalid={!!errors.heroDescription}
                maxLength={600}
                rows={4}
              />
            </Field>

            <Field label="Hero image" hint="Optional. Leave empty for a text-only hero." optional>
              <ImageUpload
                value={values.heroImageUrl}
                onChange={(url) => setValue("heroImageUrl", url)}
                maxMb={1}
                className="max-w-[320px]"
              />
            </Field>

            {values.heroImageUrl ? (
              <Field label="Hero image alt text" hint="Describe the photo — screen readers and Google read this." optional>
                <Input
                  value={values.heroImageAlt}
                  onChange={(e) => setValue("heroImageAlt", e.target.value)}
                  placeholder="R&D Therm fabrication shop floor in Nashik"
                />
              </Field>
            ) : null}

            {/* ── Body sections ────────────────────────── */}
            <Field
              label="Content sections"
              hint="Each section becomes an H2 with body text and optional bullet points."
              optional
            >
              <div className="flex flex-col gap-4">
                {values.sections.map((section, i) => (
                  <div
                    key={i}
                    className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                        Section {i + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setValue("sections", values.sections.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="size-4 text-[var(--color-danger)]" />
                      </Button>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Input
                        value={section.heading}
                        onChange={(e) => setSection(i, { heading: e.target.value })}
                        placeholder="Section heading (H2)"
                      />
                      <Textarea
                        value={section.body}
                        onChange={(e) => setSection(i, { body: e.target.value })}
                        rows={3}
                        placeholder="Section body text"
                      />
                      <TagInput
                        value={section.bullets}
                        onChange={(bullets) => setSection(i, { bullets })}
                        placeholder="Add a bullet point and press Enter"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setValue("sections", [...values.sections, { heading: "", body: "", bullets: [] }])
                  }
                >
                  <Plus className="mr-1.5 size-4" />
                  Add section
                </Button>
              </div>
            </Field>

            {/* ── References into existing content ─────── */}
            <CheckList
              label="Industries"
              hint="Shown as the 'Industries served' block. Only live industries can be picked."
              field="industryKeys"
              options={industries.map((i) => ({ id: i.key, label: i.label }))}
            />
            <CheckList
              label="Products"
              hint="Linked as 'Related equipment', and used to place the contextual link back from each product page."
              field="productSlugs"
              options={products.map((p) => ({ id: p.slug, label: p.title }))}
            />
            <CheckList
              label="Case studies"
              hint="Shown as delivered projects."
              field="caseStudySlugs"
              options={caseStudies.map((c) => ({ id: c.slug, label: `${c.client} — ${c.title}` }))}
            />

            {/* ── FAQs ─────────────────────────────────── */}
            <Field
              label="FAQs"
              hint="Rendered visibly on the page, and only then published as FAQ structured data."
              optional
            >
              <div className="flex flex-col gap-4">
                {values.faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                        Question {i + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setValue("faqs", values.faqs.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="size-4 text-[var(--color-danger)]" />
                      </Button>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Input
                        value={faq.question}
                        onChange={(e) => setFaq(i, { question: e.target.value })}
                        placeholder="Question"
                      />
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => setFaq(i, { answer: e.target.value })}
                        rows={3}
                        placeholder="Answer"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setValue("faqs", [...values.faqs, { question: "", answer: "" }])}
                >
                  <Plus className="mr-1.5 size-4" />
                  Add question
                </Button>
              </div>
            </Field>

            {/* ── Social / canonical overrides ─────────── */}
            <Field label="OG title" hint="Falls back to the SEO title when left empty." optional>
              <Input
                value={values.ogTitle}
                onChange={(e) => setValue("ogTitle", e.target.value)}
                maxLength={255}
              />
            </Field>
            <Field label="OG description" hint="Falls back to the meta description when left empty." optional>
              <Textarea
                value={values.ogDescription}
                onChange={(e) => setValue("ogDescription", e.target.value)}
                rows={2}
                maxLength={300}
              />
            </Field>
            <Field label="OG image" hint="Falls back to the site default (1200 × 630 recommended)." optional>
              <ImageUpload
                value={values.ogImageUrl}
                onChange={(url) => setValue("ogImageUrl", url)}
                maxMb={1}
                className="max-w-[320px]"
              />
            </Field>
            <Field
              label="Canonical URL"
              hint="Leave empty — the site derives the correct canonical from the slug. Only set this to point at a different page."
              optional
            >
              <Input
                value={values.canonicalUrl}
                onChange={(e) => setValue("canonicalUrl", e.target.value)}
                placeholder="https://rdtherm.com/…"
              />
            </Field>
          </div>
        );
      }}
    />
  );
}
