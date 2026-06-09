"use client";

import { useCallback, useState } from "react";
import type { Collection } from "@/services/mockClient";
import { useToast } from "@/providers/ToastProvider";
import { errorMessage } from "@/services/apiError";

/** Mutation helpers for a collection, wired to toast feedback. */
export function useCrud<T extends { id: string }>(collection: Collection<T>, singular: string) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const create = useCallback(
    async (input: Omit<T, "id">) => {
      setBusy(true);
      try {
        const record = await collection.create(input);
        toast.success(`${singular} created`, "Your changes are live in the CMS.");
        return record;
      } catch (err) {
        toast.error("Could not create", errorMessage(err));
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [collection, singular, toast],
  );

  const update = useCallback(
    async (id: string, patch: Partial<T>) => {
      setBusy(true);
      try {
        const record = await collection.update(id, patch);
        toast.success(`${singular} updated`);
        return record;
      } catch (err) {
        toast.error("Could not save", errorMessage(err));
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [collection, singular, toast],
  );

  const setActive = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        const record = await collection.setActive(id, isActive);
        toast.success(
          isActive ? `${singular} activated` : `${singular} deactivated`,
          isActive ? "It is now visible on the website." : "It is now hidden from the website.",
        );
        return record;
      } catch (err) {
        toast.error("Could not update status", errorMessage(err));
        throw err;
      }
    },
    [collection, singular, toast],
  );

  const remove = useCallback(
    async (id: string) => {
      setBusy(true);
      try {
        await collection.remove(id);
        toast.success(`${singular} deleted`);
      } catch (err) {
        toast.error("Could not delete", errorMessage(err));
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [collection, singular, toast],
  );

  const removeMany = useCallback(
    async (ids: string[]) => {
      setBusy(true);
      try {
        await collection.removeMany(ids);
        toast.success(`${ids.length} ${singular.toLowerCase()}s deleted`);
      } catch (err) {
        toast.error("Could not delete", errorMessage(err));
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [collection, singular, toast],
  );

  return { create, update, setActive, remove, removeMany, busy };
}
