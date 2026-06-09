"use client";

/**
 * Low-level API client for the rdtherm-api backend.
 *
 * Responsibilities:
 *  - attach the JWT access token to every request
 *  - transparently refresh an expired access token using the refresh token
 *    (single-flight: concurrent 401s share one refresh)
 *  - force logout + redirect to /login when the refresh token is also invalid
 *  - surface a clean Error (with .code / .details) for the UI
 */

import type { AdminUser } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const SESSION_KEY = "rdtherm-admin-auth";

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
  /** Absolute expiry (epoch ms). Session is cleared once passed. */
  expiresAt?: number;
}

/** Hard session lifetime — re-login required after this even if the tab stays open. */
const SESSION_MAX_MS = 24 * 60 * 60 * 1000; // 24 hours

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, string>;
  constructor(status: number, message: string, code = "ERROR", details?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/* ── Session storage ───────────────────────────────────── */

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    // sessionStorage is cleared when the browser/tab is closed → user must log
    // in again after reopening, per security requirements.
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    // Absolute-expiry guard (also covers a long-lived open tab).
    if (session.expiresAt && Date.now() > session.expiresAt) {
      window.sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function setSession(session: Session): void {
  if (typeof window === "undefined") return;
  const withExpiry: Session = {
    ...session,
    expiresAt: session.expiresAt ?? Date.now() + SESSION_MAX_MS,
  };
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(withExpiry));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
  // Remove any legacy localStorage session from older builds.
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function updateTokens(accessToken: string, refreshToken: string, user?: AdminUser) {
  const current = getSession();
  if (!current && !user) return;
  setSession({
    accessToken,
    refreshToken,
    user: user || current!.user,
    // Preserve the original absolute expiry across token refreshes.
    expiresAt: current?.expiresAt,
  });
}

function forceLogout() {
  clearSession();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

/* ── Refresh (single-flight) ───────────────────────────── */

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  const session = getSession();
  if (!session?.refreshToken) return false;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
      if (!res.ok) return false;
      const body = await res.json();
      updateTokens(body.data.accessToken, body.data.refreshToken, body.data.user);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/* ── Core request ──────────────────────────────────────── */

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  /** When body is FormData (file upload) we don't set Content-Type. */
  isForm?: boolean;
  query?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${API_URL}/api${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function rawRequest(path: string, options: RequestOptions, retried = false): Promise<unknown> {
  const { method = "GET", body, auth = true, isForm = false, query } = options;
  const headers: Record<string, string> = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (auth) {
    const session = getSession();
    if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: isForm ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  let json: { success?: boolean; data?: unknown; error?: { code?: string; message?: string; details?: Record<string, string> } } = {};
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }

  if (res.ok) return json.data;

  // Token expired / unauthorized → try a one-time refresh, then retry.
  if (res.status === 401 && auth && !retried) {
    const code = json.error?.code;
    if (code === "TOKEN_EXPIRED" || code === "UNAUTHORIZED") {
      const refreshed = await refreshTokens();
      if (refreshed) return rawRequest(path, options, true);
      forceLogout();
    }
  }

  throw new ApiError(
    res.status,
    json.error?.message || `Request failed (${res.status})`,
    json.error?.code || "ERROR",
    json.error?.details,
  );
}

export const api = {
  get: <T>(path: string, query?: RequestOptions["query"]) => rawRequest(path, { method: "GET", query }) as Promise<T>,
  post: <T>(path: string, body?: unknown) => rawRequest(path, { method: "POST", body }) as Promise<T>,
  put: <T>(path: string, body?: unknown) => rawRequest(path, { method: "PUT", body }) as Promise<T>,
  patch: <T>(path: string, body?: unknown) => rawRequest(path, { method: "PATCH", body }) as Promise<T>,
  del: (path: string) => rawRequest(path, { method: "DELETE" }) as Promise<null>,
  upload: <T>(path: string, form: FormData) => rawRequest(path, { method: "POST", body: form, isForm: true }) as Promise<T>,
  /** Public (no-auth) GET for unauthenticated calls if ever needed. */
  publicPost: <T>(path: string, body?: unknown) => rawRequest(path, { method: "POST", body, auth: false }) as Promise<T>,
};

export { API_URL };
