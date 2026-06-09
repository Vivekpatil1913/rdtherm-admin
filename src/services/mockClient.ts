/**
 * Shared data-access contract.
 *
 * These types define the `Collection<T>` interface every CMS page consumes via
 * the resource services. The live implementation lives in `apiCollection.ts`
 * (backed by the rdtherm-api backend).
 */

export interface ListParams {
  search?: string;
  page?: number;
  pageSize?: number;
  status?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  /** Arbitrary equality filters, e.g. { kind: "client" }. */
  filters?: Record<string, string | undefined>;
}

export interface ListResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Collection<T extends { id: string }> {
  list(params?: ListParams): Promise<ListResult<T>>;
  all(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  create(input: Omit<T, "id">): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  /** Set just the active flag (toggle) — avoids full-record validation. */
  setActive(id: string, isActive: boolean): Promise<T>;
  remove(id: string): Promise<void>;
  removeMany(ids: string[]): Promise<void>;
  reorder(orderedIds: string[]): Promise<T[]>;
}
