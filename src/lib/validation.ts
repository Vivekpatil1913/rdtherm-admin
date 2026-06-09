/**
 * Lightweight, dependency-free form validation.
 * A `Validator<T>` maps each field of a form to a list of rules; `validate`
 * returns an errors object keyed by field. Designed to be swapped for Zod/RHF
 * later without changing component call sites (see useForm hook).
 */

export type Rule = (value: unknown, all: Record<string, unknown>) => string | null;

export type Schema = Record<string, Rule[]>;

export type Errors = Record<string, string>;

export const rules = {
  required:
    (message = "This field is required"): Rule =>
    (value) => {
      if (value === null || value === undefined) return message;
      if (typeof value === "string" && value.trim() === "") return message;
      if (Array.isArray(value) && value.length === 0) return message;
      return null;
    },
  minLength:
    (min: number, message?: string): Rule =>
    (value) =>
      typeof value === "string" && value.trim().length < min
        ? message ?? `Must be at least ${min} characters`
        : null,
  maxLength:
    (max: number, message?: string): Rule =>
    (value) =>
      typeof value === "string" && value.length > max
        ? message ?? `Must be at most ${max} characters`
        : null,
  email:
    (message = "Enter a valid email address (e.g. name@example.com)"): Rule =>
    (value) =>
      // Requires a local part, a domain, and a TLD of at least 2 letters.
      typeof value === "string" &&
      value !== "" &&
      !/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value.trim())
        ? message
        : null,
  /** Letters and spaces only — for person names (allows . ' - found in real names). */
  alpha:
    (message = "Only letters and spaces are allowed"): Rule =>
    (value) =>
      typeof value === "string" && value.trim() !== "" && !/^[A-Za-z][A-Za-z .'-]*$/.test(value.trim())
        ? message
        : null,
  /** Indian mobile number: 10 digits, starting 6–9. */
  mobile:
    (message = "Enter a valid 10-digit mobile number starting 6–9"): Rule =>
    (value) =>
      typeof value === "string" && value.trim() !== "" && !/^[6-9]\d{9}$/.test(value.trim())
        ? message
        : null,
  url:
    (message = "Enter a valid URL"): Rule =>
    (value) => {
      if (typeof value !== "string" || value === "") return null;
      try {
        new URL(value);
        return null;
      } catch {
        return message;
      }
    },
  slug:
    (message = "Use lowercase letters, numbers and dashes only"): Rule =>
    (value) =>
      typeof value === "string" && value !== "" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
        ? message
        : null,
  match:
    (field: string, message = "Values do not match"): Rule =>
    (value, all) =>
      value !== all[field] ? message : null,
};

export function validate(values: Record<string, unknown>, schema: Schema): Errors {
  const errors: Errors = {};
  for (const field in schema) {
    for (const rule of schema[field]) {
      const error = rule(values[field], values);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }
  return errors;
}
