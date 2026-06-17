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
};

const columns: Column<Faq>[] = [
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
      description="Frequently asked questions shown on product pages."
      singular="FAQ"
      collection={faqService}
      columns={columns}
      searchPlaceholder="Search questions…"
      emptyValues={{ question: "", answer: "" }}
      schema={{
        question: [rules.required("Please enter the question"), rules.minLength(8), rules.maxLength(100)],
        answer: [rules.required("Please enter the answer"), rules.minLength(15), rules.maxLength(250)],
      }}
      toForm={(row) => ({ question: row.question, answer: row.answer })}
      fromForm={(v) => ({ ...v, isActive: true, order: 0, createdAt: "", updatedAt: "" })}
      empty={{ icon: HelpCircle, title: "No FAQs yet", description: "Add your first question and answer." }}
      modalSize="md"
      renderForm={({ values, errors, setValue }) => (
        <>
          <Field label="Question" error={errors.question} required count={values.question.length} max={100}>
            <Input value={values.question} onChange={(e) => setValue("question", e.target.value)} invalid={!!errors.question} maxLength={100} placeholder="What sizes can R&D Therm fabricate?" />
          </Field>
          <Field label="Answer" error={errors.answer} required count={values.answer.length} max={250}>
            <Textarea value={values.answer} onChange={(e) => setValue("answer", e.target.value)} invalid={!!errors.answer} rows={5} maxLength={250} />
          </Field>
        </>
      )}
    />
  );
}
