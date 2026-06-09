"use client";

import { api } from "./apiClient";
import type { Collection, ListParams, ListResult } from "./mockClient";

/**
 * API-backed implementation of the `Collection<T>` interface used across the
 * admin. Drop-in replacement for the mock `createCollection` — every page,
 * hook and component keeps working unchanged.
 */
export function apiCollection<T extends { id: string }>(basePath: string): Collection<T> {
  return {
    async list(params: ListParams = {}): Promise<ListResult<T>> {
      const { search, page = 1, pageSize = 10, status, sortBy, sortDir, filters = {} } = params;
      const query: Record<string, string | number | undefined> = {
        search,
        page,
        pageSize,
        status,
        sortBy,
        sortDir,
      };
      for (const [k, v] of Object.entries(filters)) {
        if (v !== undefined) query[k] = v;
      }
      return api.get<ListResult<T>>(basePath, query);
    },

    async all(): Promise<T[]> {
      const result = await api.get<ListResult<T>>(basePath, { pageSize: 100, page: 1 });
      return result.items;
    },

    async get(id: string): Promise<T | undefined> {
      try {
        return await api.get<T>(`${basePath}/${id}`);
      } catch {
        return undefined;
      }
    },

    create(input: Omit<T, "id">): Promise<T> {
      return api.post<T>(basePath, input);
    },

    update(id: string, patch: Partial<T>): Promise<T> {
      return api.put<T>(`${basePath}/${id}`, patch);
    },

    setActive(id: string, isActive: boolean): Promise<T> {
      return api.patch<T>(`${basePath}/${id}/active`, { isActive });
    },

    async remove(id: string): Promise<void> {
      await api.del(`${basePath}/${id}`);
    },

    async removeMany(ids: string[]): Promise<void> {
      await api.post(`${basePath}/bulk-delete`, { ids });
    },

    reorder(orderedIds: string[]): Promise<T[]> {
      return api.patch<T[]>(`${basePath}/reorder`, { ids: orderedIds });
    },
  };
}
