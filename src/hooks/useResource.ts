"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Collection, ListParams, ListResult } from "@/services/mockClient";
import { useDebounce } from "./useDebounce";

interface UseResourceOptions {
  pageSize?: number;
  initialStatus?: string;
  initialFilters?: Record<string, string | undefined>;
  initialSort?: { sortBy: string; sortDir: "asc" | "desc" };
}

/**
 * Drives a list view backed by any `Collection`: search, status filter,
 * arbitrary filters, sorting, pagination and refetch — all wired to a single
 * loading flag. Pages compose this with the <DataTable> component.
 */
export function useResource<T extends { id: string }>(
  collection: Collection<T>,
  options: UseResourceOptions = {},
) {
  const { pageSize = 10, initialStatus = "all", initialFilters = {}, initialSort } = options;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(initialStatus);
  const [filters, setFilters] = useState<Record<string, string | undefined>>(initialFilters);
  // Default every list to newest-first so freshly added records appear on top.
  const [sort, setSort] = useState(initialSort ?? { sortBy: "createdAt", sortDir: "desc" as const });
  const [result, setResult] = useState<ListResult<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const reqId = useRef(0);

  const fetchData = useCallback(async () => {
    const params: ListParams = {
      search: debouncedSearch,
      page,
      pageSize,
      status,
      filters,
      sortBy: sort?.sortBy,
      sortDir: sort?.sortDir,
    };
    const current = ++reqId.current;
    setIsLoading(true);
    setError(null);
    try {
      const data = await collection.list(params);
      // Drop stale responses if a newer request started.
      if (current === reqId.current) {
        setResult(data);
        setIsLoading(false);
      }
    } catch (err) {
      // Network failure (backend down), expired session, etc. Surface it as
      // state instead of letting it bubble up as an unhandled rejection that
      // crashes the page and leaves it stuck in the loading spinner forever.
      if (current === reqId.current) {
        setError(err instanceof Error ? err : new Error("Failed to load data"));
        setIsLoading(false);
      }
    }
  }, [collection, debouncedSearch, page, pageSize, status, filters, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to first page whenever the query narrows.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, filters]);

  const setFilter = useCallback((key: string, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleSort = useCallback((field: string) => {
    setSort((prev) =>
      prev?.sortBy === field
        ? { sortBy: field, sortDir: prev.sortDir === "asc" ? "desc" : "asc" }
        : { sortBy: field, sortDir: "asc" },
    );
  }, []);

  return {
    items: result?.items ?? [],
    total: result?.total ?? 0,
    totalPages: result?.totalPages ?? 1,
    page,
    pageSize,
    isLoading,
    error,
    search,
    status,
    filters,
    sort,
    setSearch,
    setPage,
    setStatus,
    setFilter,
    setFilters,
    toggleSort,
    refetch: fetchData,
  };
}
