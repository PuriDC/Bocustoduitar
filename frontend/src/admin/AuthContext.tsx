import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Token storage key. The Bocusto Luthier admin signs its tokens with the same
 * JWT_SECRET, but the two sites sit on different domains so each keeps its own
 * copy in localStorage.
 */
const TOKEN_KEY = "bocusto_admin_token";

export type AdminUser = { id: number; username: string; fullName?: string; role: string; source?: string };

type AuthState = {
  user: AdminUser | null;
  token: string | null;
  checking: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  /** fetch() with the bearer token attached. */
  authedFetch: (input: string, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Validate a stored token once on load — it may have expired since last visit.
  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) throw new Error("expired");
        const data = await res.json();
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Could not sign in.");
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const authedFetch = useCallback(
    async (input: string, init: RequestInit = {}) => {
      const res = await fetch(input, {
        ...init,
        headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token ?? ""}` }
      });
      // A token that expired mid-session should drop us back to the login form.
      if (res.status === 401) logout();
      return res;
    },
    [token, logout]
  );

  const value = useMemo<AuthState>(
    () => ({ user, token, checking, login, logout, authedFetch }),
    [user, token, checking, login, logout, authedFetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside <AdminAuthProvider>.");
  return ctx;
}
