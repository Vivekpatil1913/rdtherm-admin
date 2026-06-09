"use client";

import { useEffect, useState } from "react";
import { Save, Plus, Trash2, Monitor, Moon, Sun, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Field, FormSection } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/providers/ToastProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { settingsService } from "@/services";
import { errorMessage } from "@/services/apiError";
import { cn } from "@/lib/cn";
import type { SiteSettings } from "@/types";

const TABS = [
  { value: "contact", label: "Contact" },
  { value: "social", label: "Social" },
  { value: "appearance", label: "Appearance" },
];

const EMPTY: SiteSettings = {
  name: "", shortName: "", parent: "", tagline: "", description: "",
  address: "", phone: "", email: "", social: [], hours: [],
};

export default function SettingsPage() {
  const toast = useToast();
  const [tab, setTab] = useState("contact");
  const [settings, setSettings] = useState<SiteSettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService
      .get()
      .then((data) => setSettings(data))
      .catch((err) => toast.error("Could not load settings", errorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (saving) return; // guard against double-submit
    setSaving(true);
    try {
      const updated = await settingsService.update(settings);
      setSettings(updated);
      toast.success("Settings saved", "Your site settings have been updated.");
    } catch (err) {
      toast.error("Could not save settings", errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Global site configuration, contact details and appearance."
      />

      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-5" />

      {loading ? (
        <Card padded>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </Card>
      ) : null}

      {!loading && tab === "contact" ? (
        <Card padded>
          <FormSection title="Contact details" description="Used in the footer, contact page and structured data.">
            <Field label="Address">
              <Textarea value={settings.address} onChange={(e) => set("address", e.target.value)} rows={2} />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Phone">
                <Input value={settings.phone} onChange={(e) => set("phone", e.target.value)} />
              </Field>
              <Field label="Email">
                <Input value={settings.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
            </div>
          </FormSection>
          <FormSection title="Business hours" description="Working hours shown in the footer.">
            <div className="flex flex-col gap-2.5">
              {settings.hours.map((h, i) => (
                <div key={i} className="grid grid-cols-2 gap-3">
                  <Input
                    value={h.label}
                    onChange={(e) => {
                      const hours = [...settings.hours];
                      hours[i] = { ...hours[i], label: e.target.value };
                      set("hours", hours);
                    }}
                  />
                  <Input
                    value={h.value}
                    onChange={(e) => {
                      const hours = [...settings.hours];
                      hours[i] = { ...hours[i], value: e.target.value };
                      set("hours", hours);
                    }}
                  />
                </div>
              ))}
            </div>
          </FormSection>
        </Card>
      ) : null}

      {!loading && tab === "social" ? (
        <Card padded>
          <FormSection title="Social links" description="Profiles linked from the footer and structured data.">
            <div className="flex flex-col gap-2.5">
              {settings.social.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={s.label}
                    className="max-w-40"
                    onChange={(e) => {
                      const social = [...settings.social];
                      social[i] = { ...social[i], label: e.target.value };
                      set("social", social);
                    }}
                  />
                  <Input
                    value={s.href}
                    placeholder="https://…"
                    onChange={(e) => {
                      const social = [...settings.social];
                      social[i] = { ...social[i], href: e.target.value };
                      set("social", social);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => set("social", settings.social.filter((_, idx) => idx !== i))}
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-[var(--color-muted)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
                    aria-label="Remove social link"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="mt-1 w-fit"
                leftIcon={<Plus className="size-4" />}
                onClick={() => set("social", [...settings.social, { label: "New", href: "#" }])}
              >
                Add social link
              </Button>
            </div>
          </FormSection>
        </Card>
      ) : null}

      {tab === "appearance" ? <AppearanceSettings /> : null}

      {!loading && tab !== "appearance" ? (
        <div className="mt-5 flex justify-end">
          <Button onClick={save} loading={saving} leftIcon={<Save className="size-4" />}>
            Save changes
          </Button>
        </div>
      ) : null}
    </>
  );
}

function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <Card padded>
      <FormSection title="Theme" description="Choose how the admin panel looks. Applies instantly.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {options.map((opt) => {
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-[var(--radius-card)] border p-5 transition-all",
                  active
                    ? "border-[var(--color-brand-strong)] bg-[var(--color-brand-soft)]/30"
                    : "border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]",
                )}
              >
                {active ? (
                  <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-[var(--color-brand-strong)] text-white">
                    <Check className="size-3" />
                  </span>
                ) : null}
                <opt.icon className="size-6 text-[var(--color-content-soft)]" />
                <span className="text-sm font-medium text-[var(--color-content)]">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </FormSection>
    </Card>
  );
}
