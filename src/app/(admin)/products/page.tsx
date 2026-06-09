"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes, Plus, Star } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { TableToolbar } from "@/components/data-table/TableToolbar";
import { RowActionBar } from "@/components/data-table/RowActionBar";
import { useResource } from "@/hooks/useResource";
import { useCrud } from "@/hooks/useCrud";
import { productService } from "@/services";
import { truncate } from "@/lib/format";
import type { Product } from "@/types";

export default function ProductsPage() {
  const router = useRouter();
  const resource = useResource<Product>(productService);
  const crud = useCrud(productService, "Product");
  const [deleting, setDeleting] = useState<Product | null>(null);

  const toggleActive = async (row: Product, active: boolean) => {
    try {
      await crud.setActive(row.id, active);
      resource.refetch();
    } catch {
      /* error toast already shown */
    }
  };

  const columns: Column<Product>[] = [
    {
      key: "title",
      header: "Product",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <img src={row.cover} alt="" className="h-12 w-16 shrink-0 rounded-md object-cover" />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-medium text-[var(--color-content)]">
              {row.title}
              {row.featured ? <Star className="size-3.5 fill-[var(--color-warning)] text-[var(--color-warning)]" /> : null}
            </p>
            <p className="max-w-md truncate text-[12px] text-[var(--color-muted)]">{truncate(row.summary, 80)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "compliance",
      header: "Compliance",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.compliance.slice(0, 2).map((c) => (
            <Badge key={c} tone="neutral">{c}</Badge>
          ))}
          {row.compliance.length > 2 ? <Badge tone="neutral">+{row.compliance.length - 2}</Badge> : null}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        description="The equipment catalogue — pressure vessels, columns, exchangers and more."
        actions={
          <Button leftIcon={<Plus className="size-4" />} href="/products/new">
            Add product
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <TableToolbar
          search={resource.search}
          onSearch={resource.setSearch}
          searchPlaceholder="Search products…"
        />
        <DataTable<Product>
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
              onView={() => router.push(`/products/${row.id}`)}
              onEdit={() => router.push(`/products/${row.id}`)}
              onDelete={() => setDeleting(row)}
              active={row.isActive}
              onToggle={(active) => toggleActive(row, active)}
              toggleEntity="product"
            />
          )}
          empty={{
            icon: Boxes,
            title: "No products found",
            description: "Add your first product to the catalogue.",
            action: (
              <Button leftIcon={<Plus className="size-4" />} href="/products/new">
                Add product
              </Button>
            ),
          }}
        />
        {resource.items.length ? (
          <div className="border-t border-[var(--color-border)]">
            <Pagination page={resource.page} totalPages={resource.totalPages} total={resource.total} pageSize={resource.pageSize} onPageChange={resource.setPage} />
          </div>
        ) : null}
      </Card>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) {
            await crud.remove(deleting.id);
            setDeleting(null);
            resource.refetch();
          }
        }}
        title="Delete product?"
        confirmLabel="Delete"
        loading={crud.busy}
      />
    </>
  );
}
