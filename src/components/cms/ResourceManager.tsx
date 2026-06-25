"use client";

import { useState } from "react";
import { Plus, type LucideIcon } from "lucide-react";
import type { Collection } from "@/services/mockClient";
import type { Schema } from "@/lib/validation";
import { useResource } from "@/hooks/useResource";
import { useCrud } from "@/hooks/useCrud";
import { useForm } from "@/hooks/useForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { TableToolbar } from "@/components/data-table/TableToolbar";
import { RowActionBar } from "@/components/data-table/RowActionBar";
import { Pagination } from "@/components/ui/Pagination";
import type { SelectOption } from "@/components/ui/Select";

export interface FormRenderProps<V> {
  values: V;
  errors: Record<string, string>;
  setValue: <K extends keyof V>(field: K, value: V[K]) => void;
}

interface ExtraFilter {
  key: string;
  options: SelectOption[];
}

interface ResourceManagerProps<T extends { id: string }, V extends Record<string, unknown>> {
  title: string;
  description: string;
  singular: string;
  collection: Collection<T>;
  columns: Column<T>[];
  /** Free-text search placeholder. */
  searchPlaceholder?: string;
  extraFilter?: ExtraFilter;
  /** Always-applied list filters (e.g. pin a logo "kind"). Not shown as a control. */
  baseFilters?: Record<string, string>;
  /** Form scaffolding for the create/edit modal. */
  emptyValues: V;
  schema?: Schema;
  /** Map an existing record into editable form values. */
  toForm: (row: T) => V;
  /** Map submitted form values into a create/update payload. */
  fromForm: (values: V) => Omit<T, "id">;
  renderForm: (props: FormRenderProps<V>) => React.ReactNode;
  modalSize?: "sm" | "md" | "lg" | "xl";
  empty: { icon: LucideIcon; title: string; description?: string };
}

/**
 * Config-driven CRUD module. Composes the list (search, filters, sort,
 * pagination) with a create/edit modal and a delete confirmation — the shared
 * pattern behind most CMS sections.
 */
export function ResourceManager<T extends { id: string }, V extends Record<string, unknown>>(
  props: ResourceManagerProps<T, V>,
) {
  const {
    title,
    description,
    singular,
    collection,
    columns,
    searchPlaceholder,
    extraFilter,
    baseFilters,
    emptyValues,
    schema,
    toForm,
    fromForm,
    renderForm,
    modalSize = "lg",
    empty,
  } = props;

  const resource = useResource<T>(collection, { initialFilters: baseFilters });
  const crud = useCrud<T>(collection, singular);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);

  const form = useForm<V>({
    initialValues: emptyValues,
    schema,
    onSubmit: async (values) => {
      // useCrud shows the error toast and re-throws; useForm maps any field
      // errors (e.g. duplicate name) inline and keeps the modal open.
      if (editing) {
        await crud.update(editing.id, fromForm(values) as Partial<T>);
      } else {
        await crud.create(fromForm(values));
      }
      setModalOpen(false);
      setEditing(null);
      resource.refetch();
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset(emptyValues);
    setModalOpen(true);
  };

  const openEdit = (row: T) => {
    setEditing(row);
    form.reset(toForm(row));
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleting) {
      await crud.remove(deleting.id);
      setDeleting(null);
      resource.refetch();
    }
  };

  // Toggle the is_active flag via the dedicated endpoint (no full-record validation).
  const toggleActive = async (row: T, active: boolean) => {
    try {
      await crud.setActive(row.id, active);
      resource.refetch();
    } catch {
      /* error toast already shown */
    }
  };

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button leftIcon={<Plus className="size-4" />} onClick={openCreate}>
            Add {singular}
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <TableToolbar
          search={resource.search}
          onSearch={resource.setSearch}
          searchPlaceholder={searchPlaceholder}
          filters={
            extraFilter
              ? [
                  {
                    value: resource.filters[extraFilter.key] ?? "all",
                    onChange: (v) => resource.setFilter(extraFilter.key, v),
                    options: [{ value: "all", label: "All" }, ...extraFilter.options],
                  },
                ]
              : []
          }
        />

        <DataTable<T>
          columns={columns}
          rows={resource.items}
          loading={resource.isLoading}
          showIndex
          startIndex={(resource.page - 1) * resource.pageSize}
          sortBy={resource.sort?.sortBy}
          sortDir={resource.sort?.sortDir}
          onSort={resource.toggleSort}
          rowActions={(row) => (
            <RowActionBar
              onView={() => openEdit(row)}
              onEdit={() => openEdit(row)}
              onDelete={() => setDeleting(row)}
              active={(row as { isActive?: boolean }).isActive}
              onToggle={(active) => toggleActive(row, active)}
              toggleEntity={singular.toLowerCase()}
            />
          )}
          empty={{
            ...empty,
            action: (
              <Button leftIcon={<Plus className="size-4" />} onClick={openCreate}>
                Add {singular}
              </Button>
            ),
          }}
        />

        {resource.items.length ? (
          <div className="border-t border-[var(--color-border)]">
            <Pagination
              page={resource.page}
              totalPages={resource.totalPages}
              total={resource.total}
              pageSize={resource.pageSize}
              onPageChange={resource.setPage}
            />
          </div>
        ) : null}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${singular}` : `Add ${singular}`}
        description={editing ? "Update the details below." : `Create a new ${singular.toLowerCase()}.`}
        size={modalSize}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => form.handleSubmit()} loading={form.isSubmitting}>
              {editing ? "Save changes" : `Create ${singular}`}
            </Button>
          </>
        }
      >
        <form
          onSubmit={form.handleSubmit}
          className="flex flex-col gap-4"
        >
          {renderForm({ values: form.values, errors: form.errors, setValue: form.setValue })}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title={`Delete ${singular.toLowerCase()}?`}
        confirmLabel="Delete"
        loading={crud.busy}
      />
    </>
  );
}
