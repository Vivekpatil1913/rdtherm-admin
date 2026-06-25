"use client";

import { useCallback, useRef, useState } from "react";
import { validate, type Errors, type Schema } from "@/lib/validation";

interface UseFormOptions<T> {
  initialValues: T;
  schema?: Schema;
  onSubmit: (values: T) => void | Promise<void>;
}

/**
 * Minimal form controller with synchronous schema validation.
 * Field-level errors surface only after a field is touched or on submit, so the
 * form never yells at the user before they've had a chance to type.
 */
export function useForm<T extends Record<string, unknown>>({
  initialValues,
  schema,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Synchronous guard — blocks a second submit before React re-renders the
  // disabled button (prevents duplicate API calls from rapid double-clicks).
  const submittingRef = useRef(false);

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        if (!prev[field as string]) return prev;
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    },
    [],
  );

  const setManyValues = useCallback((patch: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched((prev) => ({ ...prev, [field as string]: true }));
      if (schema) {
        const fieldErrors = validate(values, schema);
        setErrors((prev) => ({ ...prev, [field as string]: fieldErrors[field as string] ?? "" }));
      }
    },
    [schema, values],
  );

  const reset = useCallback((next?: T) => {
    setValues(next ?? initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      // Ignore re-entrant submits while a request is already in flight.
      if (submittingRef.current) return false;

      if (schema) {
        const validationErrors = validate(values, schema);
        if (Object.keys(validationErrors).length) {
          setErrors(validationErrors);
          setTouched(
            Object.keys(schema).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
          );
          return false;
        }
      }
      submittingRef.current = true;
      setIsSubmitting(true);
      try {
        await onSubmit(values);
        return true;
      } catch (err) {
        // Surface server-side field errors (e.g. uniqueness) inline on the field.
        const details = (err as { details?: unknown } | null)?.details;
        if (details && typeof details === "object") {
          const fieldErrs = Object.entries(details as Record<string, unknown>).filter(
            ([k, v]) => k in values && typeof v === "string",
          ) as [string, string][];
          if (fieldErrs.length) {
            setErrors((prev) => ({ ...prev, ...Object.fromEntries(fieldErrs) }));
            setTouched((prev) => ({
              ...prev,
              ...Object.fromEntries(fieldErrs.map(([k]) => [k, true])),
            }));
          }
        }
        return false;
      } finally {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [schema, values, onSubmit],
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setManyValues,
    setValues,
    handleBlur,
    handleSubmit,
    reset,
  };
}
