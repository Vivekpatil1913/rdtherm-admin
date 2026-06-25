"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Newspaper, Plus } from "lucide-react";
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
import { blogService } from "@/services";
import { formatDate } from "@/lib/format";
import type { BlogPost } from "@/types";

export default function BlogsPage() {
  const router = useRouter();
  const resource = useResource<BlogPost>(blogService, { initialSort: { sortBy: "date", sortDir: "desc" } });
  const crud = useCrud(blogService, "Article");
  const [deleting, setDeleting] = useState<BlogPost | null>(null);

  const toggleActive = async (row: BlogPost, active: boolean) => {
    try {
      await crud.setActive(row.id, active);
      resource.refetch();
    } catch {
      /* error toast already shown */
    }
  };

  const columns: Column<BlogPost>[] = [
    {
      key: "title",
      header: "Article",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <img src={row.cover} alt="" className="h-12 w-16 shrink-0 rounded-md object-cover" />
          <div className="min-w-0">
            <p className="truncate font-medium text-[var(--color-content)]">{row.title}</p>
            <p className="truncate text-[12px] text-[var(--color-muted)]">{row.author}</p>
          </div>
        </div>
      ),
    },
    { key: "category", header: "Category", render: (row) => <Badge tone="brand">{row.category}</Badge> },
    { key: "date", header: "Date", sortable: true, render: (row) => <span className="text-[13px]">{formatDate(row.date)}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Blogs / Articles"
        description="Long-form articles and case studies for the Insights section."
        actions={
          <Button leftIcon={<Plus className="size-4" />} href="/blogs/new">
            New article
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <TableToolbar
          search={resource.search}
          onSearch={resource.setSearch}
          searchPlaceholder="Search articles…"
        />
        <DataTable<BlogPost>
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
              onView={() => router.push(`/blogs/${row.id}?view=1`)}
              onEdit={() => router.push(`/blogs/${row.id}`)}
              onDelete={() => setDeleting(row)}
              active={row.isActive}
              onToggle={(active) => toggleActive(row, active)}
              toggleEntity="article"
            />
          )}
          empty={{
            icon: Newspaper,
            title: "No articles found",
            description: "Write your first article to get started.",
            action: (
              <Button leftIcon={<Plus className="size-4" />} href="/blogs/new">
                New article
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
        title="Delete article?"
        confirmLabel="Delete"
        loading={crud.busy}
      />
    </>
  );
}
