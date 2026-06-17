"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lock, Loader2, CircleAlert } from "lucide-react";
import { Field } from "@/components/form/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
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
  // Validate the link on load so an expired/used token shows the error immediately.
  const [tokenStatus, setTokenStatus] = useState<"checking" | "valid" | "invalid">(
    token ? "checking" : "invalid",
  );

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api
      .publicPost<{ valid: boolean }>("/auth/verify-reset-token", { token })
      .then((res) => !cancelled && setTokenStatus(res?.valid ? "valid" : "invalid"))
      .catch(() => !cancelled && setTokenStatus("invalid"));
    return () => {
      cancelled = true;
    };
  }, [token]);

  const form = useForm({
    initialValues: { password: "", confirm: "" },
    schema: {
      password: [rules.required("Please enter your password"), rules.minLength(8)],
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

  if (tokenStatus === "checking") {
    return (
      <div className="py-8 text-center">
        <Loader2 className="mx-auto size-7 animate-spin text-[var(--color-muted)]" />
        <p className="mt-3 text-sm text-[var(--color-muted)]">Checking your reset link…</p>
      </div>
    );
  }

  if (tokenStatus === "invalid") {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-[var(--color-danger-soft)] text-[var(--color-danger)]">
          <CircleAlert className="size-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-content)]">Link expired or invalid</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
          This password reset link has expired (links are valid for 15 minutes) or has already been used. Please request a
          new one.
        </p>
        <Button href="/forgot-password" className="mt-6 w-full">
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
          <PasswordInput value={form.values.password} onChange={(e) => form.setValue("password", e.target.value)} onBlur={() => form.handleBlur("password")} invalid={!!form.errors.password} placeholder="••••••••" leftIcon={<Lock className="size-4" />} />
        </Field>
        <Field label="Confirm password" error={form.touched.confirm ? form.errors.confirm : ""} required>
          <PasswordInput value={form.values.confirm} onChange={(e) => form.setValue("confirm", e.target.value)} onBlur={() => form.handleBlur("confirm")} invalid={!!form.errors.confirm} placeholder="••••••••" leftIcon={<Lock className="size-4" />} />
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
