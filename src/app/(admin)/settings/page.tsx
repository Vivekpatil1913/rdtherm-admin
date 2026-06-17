"use client";

import { useEffect, useState } from "react";
import { Save, Monitor, Moon, Sun, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Field, FormSection } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toggle } from "@/components/ui/Toggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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

/**
 * The website footer renders a fixed set of social platforms (matched to an icon
 * by label). The admin can only edit each profile URL or hide an icon — not add
 * or remove platforms — so the list is locked to these four.
 */
const SOCIAL_PLATFORMS = ["Facebook", "Instagram", "Twitter", "LinkedIn"] as const;

type SocialEntry = { label: string; href: string; active?: boolean };

/** Collapse whatever the API returns into exactly the four fixed platforms, in order. */
function normalizeSocial(list: SocialEntry[]): SocialEntry[] {
  return SOCIAL_PLATFORMS.map((label) => {
    const cur = list.find((s) => s.label === label);
    return { label, href: cur?.href ?? "", active: cur?.active ?? true };
  });
}

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
  // Social on/off toggle goes through a confirmation step (admin-wide pattern).
  const [socialConfirm, setSocialConfirm] = useState<{ label: string; willActivate: boolean } | null>(null);
  // Per-field validation errors for the Contact tab.
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearErr = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  useEffect(() => {
    settingsService
      .get()
      .then((data) => setSettings({ ...data, social: normalizeSocial(data.social) }))
      .catch((err) => toast.error("Could not load settings", errorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  // All Contact-tab fields are required; phone/email also format-checked.
  const validateContact = () => {
    const e: Record<string, string> = {};
    if (!settings.address.trim()) e.address = "Please enter the address";
    const phoneDigits = settings.phone.replace(/^\+?91\s*/, "").replace(/\D/g, "");
    if (!phoneDigits) e.phone = "Please enter the phone number";
    else if (!/^[6-9]\d{9}$/.test(phoneDigits))
      e.phone = "Enter a valid 10-digit mobile number starting 6, 7, 8 or 9.";
    if (!settings.email.trim()) e.email = "Please enter the email";
    else if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(settings.email.trim()))
      e.email = "Enter a valid email (e.g. abc@gmail.com).";
    // Day label: letters/spaces/hyphen (e.g. "Mon to Fri", "Saturday").
    const dayRe = /^[A-Za-z][A-Za-z \-]*$/;
    // Hours: "Closed" or a time range like "8:00am - 7:00pm".
    const hoursRe = /^(closed|(1[0-2]|0?[1-9]):[0-5]\d\s?(am|pm)\s*-\s*(1[0-2]|0?[1-9]):[0-5]\d\s?(am|pm))$/i;
    settings.hours.forEach((h, i) => {
      if (!h.label.trim()) e[`hours.${i}.label`] = "Please enter the day";
      else if (!dayRe.test(h.label.trim())) e[`hours.${i}.label`] = "Use day names only (e.g. Mon to Fri).";
      if (!h.value.trim()) e[`hours.${i}.value`] = "Please enter the hours";
      else if (!hoursRe.test(h.value.trim())) e[`hours.${i}.value`] = 'Use e.g. "8:00am - 7:00pm" or "Closed".';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (saving) return; // guard against double-submit
    if (!validateContact()) {
      setTab("contact");
      toast.error("Please complete all fields", "All contact details and business hours are required.");
      return;
    }
    setSaving(true);
    try {
      const updated = await settingsService.update(settings);
      setSettings({ ...updated, social: normalizeSocial(updated.social) });
      toast.success("Settings saved", "Your site settings have been updated.");
    } catch (err) {
      toast.error("Could not save settings", errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Activating/deactivating a social link persists immediately (admin-wide
  // toggle behaviour) so the change is reflected on the website right away —
  // no separate "Save changes" step needed for the on/off state.
  const applySocialToggle = async () => {
    const c = socialConfirm;
    if (!c) return;
    setSocialConfirm(null);
    const prev = settings;
    const next = {
      ...settings,
      social: settings.social.map((item) =>
        item.label === c.label ? { ...item, active: c.willActivate } : item,
      ),
    };
    setSettings(next); // optimistic
    try {
      const updated = await settingsService.update(next);
      setSettings({ ...updated, social: normalizeSocial(updated.social) });
      toast.success(
        "Social links updated",
        `${c.label} is now ${c.willActivate ? "visible" : "hidden"} on the website.`,
      );
    } catch (err) {
      setSettings(prev); // revert on failure
      toast.error("Could not update social link", errorMessage(err));
    }
  };

  // The 10 local digits behind the fixed +91 prefix on the Phone field.
  const phoneDigits = settings.phone.replace(/^\+?91\s*/, "").replace(/\D/g, "").slice(0, 10);

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
            <Field label="Address" required error={errors.address} count={settings.address.length} max={200}>
              <Textarea
                value={settings.address}
                invalid={!!errors.address}
                maxLength={200}
                onChange={(e) => {
                  set("address", e.target.value.slice(0, 200));
                  clearErr("address");
                }}
                rows={2}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Phone" required error={errors.phone}>
                <div className="flex">
                  <span
                    className={cn(
                      "inline-flex h-10 shrink-0 items-center rounded-l-[var(--radius-field)] border border-r-0 bg-[var(--color-bg-subtle)] px-3 text-sm font-medium text-[var(--color-muted)]",
                      errors.phone ? "border-[var(--color-danger)]" : "border-[var(--color-border-strong)]",
                    )}
                  >
                    +91
                  </span>
                  <input
                    value={phoneDigits}
                    onChange={(e) => {
                      // Digits only; first digit must be 6-9 (drop leading 0-5).
                      const digits = e.target.value.replace(/\D/g, "").replace(/^[0-5]+/, "").slice(0, 10);
                      set("phone", digits ? `+91 ${digits}` : "");
                      clearErr("phone");
                    }}
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="9876543210"
                    className={cn(
                      "h-10 w-full rounded-r-[var(--radius-field)] border bg-[var(--color-surface)] px-3 text-sm text-[var(--color-content)] placeholder:text-[var(--color-muted)] transition-colors",
                      "focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20",
                      errors.phone ? "border-[var(--color-danger)]" : "border-[var(--color-border-strong)]",
                    )}
                  />
                </div>
              </Field>
              <Field label="Email" required error={errors.email}>
                <Input
                  value={settings.email}
                  invalid={!!errors.email}
                  onChange={(e) => {
                    set("email", e.target.value);
                    clearErr("email");
                  }}
                />
              </Field>
            </div>
          </FormSection>
          <FormSection title="Business hours" description="Working hours shown in the footer.">
            <div className="flex flex-col gap-3">
              {settings.hours.map((h, i) => (
                <div key={i} className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      value={h.label}
                      invalid={!!errors[`hours.${i}.label`]}
                      onChange={(e) => {
                        const hours = [...settings.hours];
                        hours[i] = { ...hours[i], label: e.target.value };
                        set("hours", hours);
                        clearErr(`hours.${i}.label`);
                      }}
                    />
                    {errors[`hours.${i}.label`] ? (
                      <p className="mt-1 text-xs text-[var(--color-danger)]">{errors[`hours.${i}.label`]}</p>
                    ) : null}
                  </div>
                  <div>
                    <Input
                      value={h.value}
                      invalid={!!errors[`hours.${i}.value`]}
                      onChange={(e) => {
                        const hours = [...settings.hours];
                        hours[i] = { ...hours[i], value: e.target.value };
                        set("hours", hours);
                        clearErr(`hours.${i}.value`);
                      }}
                    />
                    {errors[`hours.${i}.value`] ? (
                      <p className="mt-1 text-xs text-[var(--color-danger)]">{errors[`hours.${i}.value`]}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </FormSection>
        </Card>
      ) : null}

      {!loading && tab === "social" ? (
        <Card padded>
          <FormSection
            title="Social links"
            description="Update each profile URL, or switch one off to hide its icon on the website. The set of platforms is fixed to match the site footer."
          >
            <div className="flex flex-col gap-3">
              {settings.social.map((s) => {
                const active = s.active !== false;
                const update = (patch: Partial<SocialEntry>) =>
                  set(
                    "social",
                    settings.social.map((item) => (item.label === s.label ? { ...item, ...patch } : item)),
                  );
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-sm font-medium text-[var(--color-content)]">
                      {s.label}
                    </span>
                    <Input
                      value={s.href}
                      placeholder="https://…"
                      className="flex-1"
                      disabled={!active}
                      invalid={active && s.href.trim() !== "" && !/^https?:\/\//i.test(s.href.trim())}
                      onChange={(e) => update({ href: e.target.value })}
                    />
                    <div className="flex w-20 shrink-0 items-center justify-end gap-2">
                      <span className="text-xs text-[var(--color-muted)]">{active ? "On" : "Off"}</span>
                      <Toggle
                        checked={active}
                        onChange={(v) => setSocialConfirm({ label: s.label, willActivate: v })}
                        size="sm"
                        label={`${active ? "Deactivate" : "Activate"} ${s.label}`}
                      />
                    </div>
                  </div>
                );
              })}
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

      <ConfirmDialog
        open={!!socialConfirm}
        onClose={() => setSocialConfirm(null)}
        onConfirm={applySocialToggle}
        danger={!socialConfirm?.willActivate}
        title={socialConfirm ? `${socialConfirm.willActivate ? "Activate" : "Deactivate"} ${socialConfirm.label}?` : ""}
        confirmLabel={socialConfirm?.willActivate ? "Activate" : "Deactivate"}
        body={
          socialConfirm?.willActivate
            ? `${socialConfirm.label} will be shown in the website footer right away.`
            : `${socialConfirm?.label} will be hidden from the website footer right away. You can reactivate it anytime.`
        }
      />
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
