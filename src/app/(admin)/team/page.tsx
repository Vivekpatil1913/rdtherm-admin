"use client";

import { Users } from "lucide-react";
import { ResourceManager } from "@/components/cms/ResourceManager";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ImageUpload } from "@/components/form/ImageUpload";
import { IMAGE_PRESETS } from "@/lib/image";
import { teamService } from "@/services";
import { rules } from "@/lib/validation";
import { truncate } from "@/lib/format";
import type { Column } from "@/components/data-table/DataTable";
import type { TeamMember, TeamGroup } from "@/types";

type FormValues = {
  name: string;
  role: string;
  bio: string;
  photo: string;
  group: TeamGroup;
}

const columns: Column<TeamMember>[] = [
  {
    key: "name",
    header: "Member",
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.name} src={row.photo} size="md" />
        <div>
          <p className="font-medium text-[var(--color-content)]">{row.name}</p>
          <p className="text-[12px] text-[var(--color-muted)]">{row.role}</p>
        </div>
      </div>
    ),
  },
  { key: "bio", header: "Bio", render: (row) => <p className="max-w-md text-[13px]">{truncate(row.bio, 90)}</p> },
  {
    key: "group",
    header: "Group",
    render: (row) => <Badge tone={row.group === "director" ? "brand" : "neutral"}>{row.group === "director" ? "Board" : "Team"}</Badge>,
  },
];

export default function TeamPage() {
  return (
    <ResourceManager<TeamMember, FormValues>
      title="Team Members"
      description="Board of directors and team members shown on the About page."
      singular="Member"
      collection={teamService}
      columns={columns}
      searchPlaceholder="Search by name or role…"
      extraFilter={{ key: "group", options: [{ value: "director", label: "Board of Directors" }, { value: "team", label: "Team" }] }}
      emptyValues={{ name: "", role: "", bio: "", photo: "", group: "team" }}
      schema={{ name: [rules.required(), rules.minLength(2), rules.alpha(), rules.maxLength(50)], role: [rules.required(), rules.maxLength(50)], bio: [rules.required(), rules.minLength(20), rules.maxLength(510)], photo: [rules.required("A photo is required")] }}
      toForm={(row) => ({ name: row.name, role: row.role, bio: row.bio, photo: row.photo, group: row.group })}
      fromForm={(v) => ({ ...v, isActive: true, order: 0, createdAt: "", updatedAt: "" })}
      empty={{ icon: Users, title: "No team members yet", description: "Add your first board member or teammate." }}
      renderForm={({ values, errors, setValue }) => (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
            <Field label="Photo" error={errors.photo} required>
              <ImageUpload value={values.photo} onChange={(url) => setValue("photo", url)} aspect="square" preset={IMAGE_PRESETS.teamPhoto} />
            </Field>
            <div className="flex flex-col gap-4">
              <Field label="Full name" error={errors.name} required>
                <Input value={values.name} onChange={(e) => setValue("name", e.target.value)} invalid={!!errors.name} maxLength={50} showCount placeholder="Rajeev Deshmukh" />
              </Field>
              <Field label="Role / Title" error={errors.role} required>
                <Input value={values.role} onChange={(e) => setValue("role", e.target.value)} invalid={!!errors.role} maxLength={50} showCount placeholder="Director — Engineering" />
              </Field>
              <Field label="Group">
                <Select value={values.group} onChange={(e) => setValue("group", e.target.value as TeamGroup)} options={[{ value: "director", label: "Board of Directors" }, { value: "team", label: "Team" }]} />
              </Field>
            </div>
          </div>
          <Field label="Bio" error={errors.bio} required>
            <Textarea value={values.bio} onChange={(e) => setValue("bio", e.target.value)} invalid={!!errors.bio} rows={4} maxLength={510} showCount />
          </Field>
        </>
      )}
    />
  );
}
