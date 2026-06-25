"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Field, FormSection } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { useForm } from "@/hooks/useForm";
import { rules } from "@/lib/validation";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { profileService, uploadImage } from "@/services";
import { errorMessage } from "@/services/apiError";
import { validateImageFile, IMAGE_PRESETS, presetHint } from "@/lib/image";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm({
    initialValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      avatar: user?.avatar ?? "",
    },
    schema: {
      name: [rules.required("Please enter your name"), rules.minLength(2), rules.alpha(), rules.maxLength(50)],
      email: [rules.required("Please enter your email"), rules.email()],
    },
    onSubmit: async (values) => {
      try {
        const updated = await profileService.updateProfile(values);
        updateUser(updated);
        toast.success("Profile updated", "Your details have been saved.");
      } catch (err) {
        toast.error("Could not update profile", errorMessage(err));
      }
    },
  });

  const handlePick = async (file?: File) => {
    if (!file) return;
    const invalid = await validateImageFile(file, { preset: IMAGE_PRESETS.avatar });
    if (invalid) {
      toast.error("Invalid image", invalid);
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      form.setValue("avatar", url);
    } catch (err) {
      toast.error("Upload failed", errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <PageHeader title="My profile" description="Manage your name, email and profile photo." />

      <Card padded>
        <FormSection title="Profile photo" description="Shown in the top bar and across the admin.">
          <div className="flex items-center gap-5">
            <span className="relative inline-flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-brand-soft)] text-2xl font-semibold text-[var(--color-brand-strong)]">
              {form.values.avatar ? (
                <img src={form.values.avatar} alt="Profile" className="size-full object-cover" />
              ) : (
                (form.values.name || "A").slice(0, 1).toUpperCase()
              )}
              {uploading ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="size-5 animate-spin text-white" />
                </span>
              ) : null}
            </span>

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ImagePlus className="size-4" />}
                  onClick={() => fileRef.current?.click()}
                  className="bg-[var(--color-info-soft)] text-[var(--color-info)] hover:opacity-90"
                >
                  {form.values.avatar ? "Change photo" : "Upload photo"}
                </Button>
                {form.values.avatar ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Trash2 className="size-4" />}
                    onClick={() => form.setValue("avatar", "")}
                    className="bg-[var(--color-danger-soft)] text-[var(--color-danger)] hover:opacity-90"
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-[var(--color-muted)]">
                {presetHint(IMAGE_PRESETS.avatar)} · JPG, PNG or WEBP.
              </p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePick(e.target.files?.[0])}
            />
          </div>
        </FormSection>

        <FormSection title="Account details" description="Your name and sign-in email.">
          <Field label="Full name" error={form.touched.name ? form.errors.name : ""} required>
            <Input value={form.values.name} onChange={(e) => form.setValue("name", e.target.value)} onBlur={() => form.handleBlur("name")} invalid={!!form.errors.name} maxLength={50} />
          </Field>
          <Field label="Email address" error={form.touched.email ? form.errors.email : ""} required>
            <Input type="email" value={form.values.email} onChange={(e) => form.setValue("email", e.target.value)} onBlur={() => form.handleBlur("email")} invalid={!!form.errors.email} />
          </Field>
          <Field label="Role">
            <div>
              <Badge tone="brand">{(user?.role ?? "admin").replace(/^\w/, (c) => c.toUpperCase())}</Badge>
            </div>
          </Field>
        </FormSection>

        {/* Save action at the bottom of the form */}
        <div className="flex justify-end pt-6">
          <Button onClick={() => form.handleSubmit()} loading={form.isSubmitting} leftIcon={<Save className="size-4" />}>
            Save changes
          </Button>
        </div>
      </Card>
    </>
  );
}
