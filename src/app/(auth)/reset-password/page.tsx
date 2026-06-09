"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useForm } from "@/hooks/useForm";
import { rules } from "@/lib/validation";
import { api } from "@/services/apiClient";
import { useToast } from "@/providers/ToastProvider";
import { errorMessage } from "@/services/apiError";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const token = params.get("token") || "";
  const [done, setDone] = useState(false);

  const form = useForm({
    initialValues: { password: "", confirm: "" },
    schema: {
      password: [rules.required("Password is required"), rules.minLength(8)],
      confirm: [rules.required("Please confirm your password"), rules.match("password", "Passwords do not match")],
    },
    onSubmit: async (values) => {
      try {
        await api.publicPost("/auth/reset-password", { token, password: values.password });
        setDone(true);
        setTimeout(() => router.push("/login"), 1500);
      } catch (err) {
        toast.error("Could not reset password", errorMessage(err));
      }
    },
  });

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-content)]">Invalid link</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">This reset link is missing its token.</p>
        <Button href="/forgot-password" variant="outline" className="mt-6 w-full">
          Request a new link
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-[var(--color-success-soft)] text-[var(--color-success)]">
          <CheckCircle2 className="size-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-content)]">Password updated</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-muted)] hover:text-[var(--color-content)]">
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--color-content)]">Set a new password</h1>
      <p className="mt-1.5 text-sm text-[var(--color-muted)]">Choose a strong password for your account.</p>

      <form onSubmit={form.handleSubmit} className="mt-7 flex flex-col gap-4">
        <Field label="New password" error={form.touched.password ? form.errors.password : ""} required>
          <Input type="password" value={form.values.password} onChange={(e) => form.setValue("password", e.target.value)} onBlur={() => form.handleBlur("password")} invalid={!!form.errors.password} placeholder="••••••••" leftIcon={<Lock className="size-4" />} />
        </Field>
        <Field label="Confirm password" error={form.touched.confirm ? form.errors.confirm : ""} required>
          <Input type="password" value={form.values.confirm} onChange={(e) => form.setValue("confirm", e.target.value)} onBlur={() => form.handleBlur("confirm")} invalid={!!form.errors.confirm} placeholder="••••••••" leftIcon={<Lock className="size-4" />} />
        </Field>
        <Button type="submit" size="lg" loading={form.isSubmitting} className="w-full">
          Update password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
