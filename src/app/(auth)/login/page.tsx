"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { useForm } from "@/hooks/useForm";
import { rules } from "@/lib/validation";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { errorMessage } from "@/services/apiError";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const form = useForm({
    initialValues: { email: "admin@rdtherm.com", password: "Admin@1234" },
    schema: {
      email: [rules.required("Email is required"), rules.email()],
      password: [rules.required("Password is required"), rules.minLength(6)],
    },
    onSubmit: async (values) => {
      try {
        await login(values.email, values.password);
        toast.success("Welcome back", "Signed in to the R&D Therm CMS.");
        router.push("/dashboard");
      } catch (err) {
        toast.error("Sign in failed", errorMessage(err));
      }
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--color-content)]">Sign in</h1>
      <p className="mt-1.5 text-sm text-[var(--color-muted)]">
        Welcome back. Enter your credentials to access the CMS.
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
            autoComplete="email"
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          error={form.touched.password ? form.errors.password : ""}
          required
        >
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.values.password}
              onChange={(e) => form.setValue("password", e.target.value)}
              onBlur={() => form.handleBlur("password")}
              invalid={!!form.errors.password}
              placeholder="••••••••"
              leftIcon={<Lock className="size-4" />}
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-content)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-[var(--color-content-soft)]">
            <Toggle checked={remember} onChange={setRemember} size="sm" />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-[13px] font-medium text-[var(--color-brand-strong)] hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" loading={form.isSubmitting} className="mt-2 w-full">
          Sign in
        </Button>
      </form>

      <div className="mt-6 rounded-[var(--radius-field)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] p-3.5 text-center text-[12px] text-[var(--color-muted)]">
        <span className="font-medium text-[var(--color-content-soft)]">Seeded admin:</span>{" "}
        admin@rdtherm.com / Admin@1234
      </div>
    </div>
  );
}
