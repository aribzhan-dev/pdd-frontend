// Holds the signed-in user for the whole app.
//
// On mount it revalidates the stored token against /auth/me, so a student
// whose access expired while the tab was closed is signed out rather than
// shown a broken interface.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authApi } from "@/api/auth";
import { setSessionExpiredHandler } from "@/api/client";
import { tokenStorage } from "@/lib/storage";
import type { CurrentUser, UserRole } from "@/types/api";

interface AuthState {
  user: CurrentUser | null;
  isLoading: boolean;
  signIn: (iin: string, password: string) => Promise<void>;
  signOut: () => void;
  role: UserRole | null;
  isStaff: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  // The API client calls this when refreshing fails mid-request.
  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restore(): Promise<void> {
      if (!tokenStorage.getAccess()) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await authApi.me();
        if (!cancelled) setUser(profile);
      } catch {
        tokenStorage.clear();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (iin: string, password: string) => {
    const response = await authApi.login(iin, password);
    tokenStorage.save(
      response.tokens.access_token,
      response.tokens.refresh_token,
    );
    setUser(response.user);
  }, []);

  const value = useMemo<AuthState>(() => {
    const role = (user?.role.value ?? null) as UserRole | null;
    return {
      user,
      isLoading,
      signIn,
      signOut,
      role,
      isStaff: role === "admin" || role === "manager",
    };
  }, [user, isLoading, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
