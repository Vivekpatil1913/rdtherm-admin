"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useForm } from "@/hooks/useForm";
import { rules } from "@/lib/validation";
import { api } from "@/services/apiClient";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const form = useForm({
    initialValues: { email: "" },
    schema: { email: [rules.required("Email is required"), rules.email()] },
    onSubmit: async (values) => {
      try {
        await api.publicPost("/auth/forgot-password", { email: values.email });
      } catch {
        /* always show the same confirmation to avoid leaking which emails exist */
      }
      setSent(true);
    },
  });

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-[var(--color-success-soft)] text-[var(--color-success)]">
          <MailCheck className="size-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-content)]">Check your inbox</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          If an account exists for <span className="font-medium text-[var(--color-content)]">{form.values.email}</span>,
          we&apos;ve sent a link to reset your password.
        </p>
        <Button href="/login" variant="outline" className="mt-6 w-full" leftIcon={<ArrowLeft className="size-4" />}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-muted)] hover:text-[var(--color-content)]"
      >
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--color-content)]">Reset password</h1>
      <p className="mt-1.5 text-sm text-[var(--color-muted)]">
        Enter the email associated with your account and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={form.handleSubmit} className="mt-7 flex flex-col gap-4">
        <Field label="Email address" htmlFor="email" error={form.touched.email ? form.errors.email : ""} required>
          <Input
            id="email"
            type="email"
            value={form.values.email}
            onChange={(e) => form.setValue("email", e.target.value)}
            onBlur={() => form.handleBlur("email")}
            invalid={!!form.errors.email}
            placeholder="you@rdtherm.com"
            leftIcon={<Mail className="size-4" />}
          />
        </Field>
        <Button type="submit" size="lg" loading={form.isSubmitting} className="w-full">
          Send reset link
        </Button>
      </form>
    </div>
  );
}
