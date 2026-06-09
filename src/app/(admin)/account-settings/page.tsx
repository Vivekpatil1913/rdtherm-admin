"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, LogOut, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useForm } from "@/hooks/useForm";
import { rules } from "@/lib/validation";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { profileService } from "@/services";
import { errorMessage } from "@/services/apiError";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const toast = useToast();
  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);

  const form = useForm({
    initialValues: { currentPassword: "", newPassword: "", confirm: "" },
    schema: {
      currentPassword: [rules.required("Enter your current password")],
      newPassword: [rules.required("Enter a new password"), rules.minLength(8)],
      confirm: [rules.required("Confirm your new password"), rules.match("newPassword", "Passwords do not match")],
    },
    onSubmit: async (values) => {
      try {
        await profileService.changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        toast.success("Password changed", "Your password has been updated.");
        form.reset();
      } catch (err) {
        toast.error("Could not change password", errorMessage(err));
      }
    },
  });

  const handleLogoutAll = async () => {
    try {
      await profileService.logoutAll();
    } catch {
      /* ignore */
    }
    await logout();
    router.push("/login");
  };

  return (
    <>
      <PageHeader title="Account settings" description="Manage your password and active sessions." />

      <div className="flex flex-col gap-5">
        {/* Change password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-4 text-[var(--color-brand-strong)]" /> Change password
            </CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={form.handleSubmit} className="flex max-w-md flex-col gap-4">
              <Field label="Current password" error={form.touched.currentPassword ? form.errors.currentPassword : ""} required>
                <Input type="password" value={form.values.currentPassword} onChange={(e) => form.setValue("currentPassword", e.target.value)} onBlur={() => form.handleBlur("currentPassword")} invalid={!!form.errors.currentPassword} leftIcon={<Lock className="size-4" />} />
              </Field>
              <Field label="New password" hint="At least 8 characters." error={form.touched.newPassword ? form.errors.newPassword : ""} required>
                <Input type="password" value={form.values.newPassword} onChange={(e) => form.setValue("newPassword", e.target.value)} onBlur={() => form.handleBlur("newPassword")} invalid={!!form.errors.newPassword} leftIcon={<Lock className="size-4" />} />
              </Field>
              <Field label="Confirm new password" error={form.touched.confirm ? form.errors.confirm : ""} required>
                <Input type="password" value={form.values.confirm} onChange={(e) => form.setValue("confirm", e.target.value)} onBlur={() => form.handleBlur("confirm")} invalid={!!form.errors.confirm} leftIcon={<Lock className="size-4" />} />
              </Field>
              <div>
                <Button type="submit" loading={form.isSubmitting}>
                  Update password
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-[var(--color-brand-strong)]" /> Sessions
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <p className="max-w-md text-sm text-[var(--color-muted)]">
                Sign out of the CMS on all devices. You&apos;ll need to log in again everywhere.
              </p>
              <Button variant="outline" leftIcon={<LogOut className="size-4" />} onClick={() => setConfirmLogoutAll(true)}>
                Sign out everywhere
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmLogoutAll}
        onClose={() => setConfirmLogoutAll(false)}
        onConfirm={handleLogoutAll}
        title="Sign out of all devices?"
        confirmLabel="Sign out everywhere"
        body="This will end every active session, including this one. You'll be returned to the login screen."
      />
    </>
  );
}
