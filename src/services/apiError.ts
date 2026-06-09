import { ApiError } from "./apiClient";

/**
 * Human-friendly message from an unknown thrown value. For validation errors it
 * joins the field messages so the toast is actionable.
 */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.details && Object.keys(err.details).length) {
      return Object.values(err.details).join(" ");
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}
