"use client";

import { useEffect, useMemo, useState } from "react";
import { HelpCircle } from "lucide-react";
import { ResourceManager } from "@/components/cms/ResourceManager";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { faqService, productService } from "@/services";
import { rules, type Rule } from "@/lib/validation";
import { truncate } from "@/lib/format";
import type { Column } from "@/components/data-table/DataTable";
import type { Faq, Product } from "@/types";

/**
 * Sentinel for "not tied to a product". The API accepts "" or "all" for a
 * general FAQ; a <select> cannot hold null, so the form carries this string and
 * `fromForm` passes it straight through.
 */
const ALL_PRODUCTS = "all";

type FormValues = {
  question: string;
  answer: string;
  /** Product id, or ALL_PRODUCTS for a FAQ shown on every product page. */
  productId: string;
  /** Kept as text so the box can be left empty ("add at the end"). */
  order: string;
};

/** A product deleted under a FAQ still has to read sensibly in the table. */
const productLabel = (row: Faq) =>
  row.productTitle ?? (row.productId ? "Unknown product" : "All products");

const columns: Column<Faq>[] = [
  {
    key: "order",
    header: "Sequence",
    sortable: true,
    width: "w-24",
    align: "center",
    render: (row) => (
      <span className="inline-flex min-w-7 justify-center rounded-full bg-[var(--color-bg-subtle)] px-2 py-0.5 text-[12px] font-semibold tabular-nums text-[var(--color-content)]">
        {row.order}
      </span>
    ),
  },
  {
    key: "productId",
    header: "Shown on",
    width: "w-48",
    render: (row) => (
      <span
        className={
          "inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium " +
          (row.productId
            ? "bg-[var(--color-brand)]/10 text-[var(--color-brand-strong)]"
            : "bg-[var(--color-bg-subtle)] text-[var(--color-muted)]")
        }
      >
        {productLabel(row)}
      </span>
    ),
  },
  {
    key: "question",
    header: "Question",
    sortable: true,
    render: (row) => (
      <div>
        <p className="font-medium text-[var(--color-content)]">{row.question}</p>
        <p className="mt-0.5 max-w-3xl text-[12px] text-[var(--color-muted)]">
          {truncate(row.answer, 120)}
        </p>
      </div>
    ),
  },
];

export default function FaqsPage() {
  // The picker needs every live product — a small, stable list.
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    productService
      .list({ page: 1, pageSize: 100, sortBy: "order", sortDir: "asc" })
      .then((res) => {
        if (!cancelled) setProducts(res.items);
      })
      .catch(() => {
        // A failed load leaves the picker with "All products" only, which is a
        // safe default. Never block writing a FAQ on it.
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const formOptions = useMemo(
    () => [
      { value: ALL_PRODUCTS, label: "All products (general FAQ)" },
      ...products.map((p) => ({ value: p.id, label: p.title })),
    ],
    [products],
  );

  const filterOptions = useMemo(
    () => [
      { value: "general", label: "All products (general)" },
      ...products.map((p) => ({ value: p.id, label: p.title })),
    ],
    [products],
  );

  /** Reject an id that is not one of the loaded products (or the sentinel). */
  const productExists: Rule = (value) => {
    const id = String(value ?? "");
    if (id === ALL_PRODUCTS) return null;
    if (!products.length) return null; // list never loaded — let the API decide
    return products.some((p) => p.id === id) ? null : "Please choose a product from the list";
  };

  return (
    <ResourceManager<Faq, FormValues>
      title="FAQs"
      description="Questions shown on product pages. Tie one to a product, or leave it on all products to show it everywhere."
      singular="FAQ"
      collection={faqService}
      columns={columns}
      searchPlaceholder="Search questions…"
      extraFilter={{ key: "product", options: filterOptions }}
      // List in website order, so the table reads exactly like the live page.
      initialSort={{ sortBy: "order", sortDir: "asc" }}
      emptyValues={{ question: "", answer: "", productId: ALL_PRODUCTS, order: "" }}
      schema={{
        question: [
          rules.required("Please enter the question"),
          rules.minLength(8),
          rules.maxLength(100),
        ],
        answer: [
          rules.required("Please enter the answer"),
          rules.minLength(15),
          rules.maxLength(250),
        ],
        productId: [rules.required("Please choose where this FAQ appears"), productExists],
        // Optional: blank means "put it last". The upper bound depends on how
        // many FAQs that product has, so the server has the final say and
        // returns an inline error on this field if the number is out of range.
        order: [rules.positiveInt("Sequence must be a whole number starting from 1")],
      }}
      toForm={(row) => ({
        question: row.question,
        answer: row.answer,
        productId: row.productId ?? ALL_PRODUCTS,
        order: String(row.order),
      })}
      fromForm={(v) => {
        const sequence = v.order.trim();
        return {
          question: v.question,
          answer: v.answer,
          // ALL_PRODUCTS is the API's own sentinel for a general FAQ.
          productId: v.productId,
          isActive: true,
          createdAt: "",
          updatedAt: "",
          // Omitted entirely when blank — the API then appends to the end
          // instead of trying to place the record.
          ...(sequence === "" ? {} : { order: Number(sequence) }),
        } as unknown as Omit<Faq, "id">;
      }}
      empty={{
        icon: HelpCircle,
        title: "No FAQs yet",
        description: "Add your first question and answer.",
      }}
      modalSize="md"
      renderForm={({ values, errors, setValue, total, isEditing }) => (
        <>
          <Field
            label="Question"
            error={errors.question}
            required
            count={values.question.length}
            max={100}
          >
            <Input
              value={values.question}
              onChange={(e) => setValue("question", e.target.value)}
              invalid={!!errors.question}
              maxLength={100}
              placeholder="What sizes can R&D Therm fabricate?"
            />
          </Field>
          <Field
            label="Answer"
            error={errors.answer}
            required
            count={values.answer.length}
            max={250}
          >
            <Textarea
              value={values.answer}
              onChange={(e) => setValue("answer", e.target.value)}
              invalid={!!errors.answer}
              rows={5}
              maxLength={250}
            />
          </Field>
          <Field
            label="Shown on"
            error={errors.productId}
            required
            hint="Pick a product to show this question on that page only, or leave it on all products to show it on every product page."
          >
            <Select
              options={formOptions}
              value={values.productId}
              onChange={(e) => setValue("productId", e.target.value)}
              invalid={!!errors.productId}
            />
          </Field>
          <Field
            label="Sequence"
            error={errors.order}
            hint={
              isEditing
                ? `Position within this list — 1 shows first. The other FAQs shift to make room (1–${Math.max(total, 1)}).`
                : `Position within this list — 1 shows first. Leave blank to add it last (1–${total + 1}).`
            }
          >
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              className="w-32"
              value={values.order}
              // Digits only: a stray "-" or "e" from the number input would
              // reach the API as an unusable position.
              onChange={(e) => setValue("order", e.target.value.replace(/[^0-9]/g, ""))}
              invalid={!!errors.order}
              placeholder={isEditing ? "" : "Last"}
            />
          </Field>
        </>
      )}
    />
  );
}
