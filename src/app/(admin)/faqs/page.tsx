"use client";

import { HelpCircle } from "lucide-react";
import { ResourceManager } from "@/components/cms/ResourceManager";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { faqService } from "@/services";
import { rules } from "@/lib/validation";
import { truncate } from "@/lib/format";
import type { Column } from "@/components/data-table/DataTable";
import type { Faq } from "@/types";

type FormValues = {
  question: string;
  answer: string;
  /** Kept as text so the box can be left empty ("add at the end"). */
  order: string;
};

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
    key: "question",
    header: "Question",
    sortable: true,
    render: (row) => (
      <div>
        <p className="font-medium text-[var(--color-content)]">{row.question}</p>
        <p className="mt-0.5 max-w-3xl text-[12px] text-[var(--color-muted)]">{truncate(row.answer, 120)}</p>
      </div>
    ),
  },
];

export default function FaqsPage() {
  return (
    <ResourceManager<Faq, FormValues>
      title="FAQs"
      description="Frequently asked questions shown on product pages, in the sequence set here."
      singular="FAQ"
      collection={faqService}
      columns={columns}
      searchPlaceholder="Search questions…"
      // List in website order, so the table reads exactly like the live page.
      initialSort={{ sortBy: "order", sortDir: "asc" }}
      emptyValues={{ question: "", answer: "", order: "" }}
      schema={{
        question: [rules.required("Please enter the question"), rules.minLength(8), rules.maxLength(100)],
        answer: [rules.required("Please enter the answer"), rules.minLength(15), rules.maxLength(250)],
        // Optional: blank means "put it last". The upper bound depends on how
        // many FAQs exist, so the server has the final say and returns an
        // inline error on this field if the number is out of range.
        order: [rules.positiveInt("Sequence must be a whole number starting from 1")],
      }}
      toForm={(row) => ({ question: row.question, answer: row.answer, order: String(row.order) })}
      fromForm={(v) => {
        const sequence = v.order.trim();
        return {
          question: v.question,
          answer: v.answer,
          isActive: true,
          createdAt: "",
          updatedAt: "",
          // Omitted entirely when blank — the API then appends to the end
          // instead of trying to place the record.
          ...(sequence === "" ? {} : { order: Number(sequence) }),
        } as Omit<Faq, "id">;
      }}
      empty={{ icon: HelpCircle, title: "No FAQs yet", description: "Add your first question and answer." }}
      modalSize="md"
      renderForm={({ values, errors, setValue, total, isEditing }) => (
        <>
          <Field label="Question" error={errors.question} required count={values.question.length} max={100}>
            <Input value={values.question} onChange={(e) => setValue("question", e.target.value)} invalid={!!errors.question} maxLength={100} placeholder="What sizes can R&D Therm fabricate?" />
          </Field>
          <Field label="Answer" error={errors.answer} required count={values.answer.length} max={250}>
            <Textarea value={values.answer} onChange={(e) => setValue("answer", e.target.value)} invalid={!!errors.answer} rows={5} maxLength={250} />
          </Field>
          <Field
            label="Sequence"
            error={errors.order}
            hint={
              isEditing
                ? `Position on the website — 1 shows first. The other FAQs shift to make room (1–${Math.max(total, 1)}).`
                : `Position on the website — 1 shows first. Leave blank to add it last (1–${total + 1}).`
            }
          >
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              max={isEditing ? Math.max(total, 1) : total + 1}
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
