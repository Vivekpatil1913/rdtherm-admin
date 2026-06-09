"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getSession, setSession, clearSession } from "@/services/apiClient";
import type { AdminUser } from "@/types";

interface AuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Update the cached user after a profile change. */
  updateUser: (user: AdminUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface LoginResponse {
  user: AdminUser;
  accessToken: string;
  refreshToken: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate the session on mount.
  useEffect(() => {
    const session = getSession();
    setUser(session?.user ?? null);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // No-auth request so a stale/expired token never triggers the refresh path.
    const data = await api.publicPost<LoginResponse>("/auth/login", { email, password });
    setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
    setUser(data.user);
  }, []);

  const updateUser = useCallback((next: AdminUser) => {
    const session = getSession();
    if (session) setSession({ ...session, user: next });
    setUser(next);
  }, []);

  const logout = useCallback(async () => {
    const session = getSession();
    try {
      await api.post("/auth/logout", { refreshToken: session?.refreshToken });
    } catch {
      /* ignore network/logout errors */
    }
    clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
