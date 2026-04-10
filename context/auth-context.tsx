"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getCurrentUser } from "@/lib/auth/api";
import { syncRoleCookie, syncSessionCookie } from "@/lib/auth/cookies";
import { authQueryKeys } from "@/lib/auth/query";
import { clearSessionToken } from "@/lib/auth/session";
import { User } from "@/lib/users";
import { useAuthStore } from "@/lib/stores/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isReady: boolean;
  refetchUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const token = useAuthStore((state) => state.token);

  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery<User | null>({
    queryKey: authQueryKeys.currentUser,
    queryFn: async () => {
      try {
        const res = await getCurrentUser();
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearSessionToken();
          return null;
        }

        throw error;
      }
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    enabled: hasHydrated,
    retry: false,
  });

  useEffect(() => {
    if (!hasHydrated) return;

    syncSessionCookie(token);
    syncRoleCookie(user?.role ?? null);
  }, [hasHydrated, token, user?.role]);

  const isReady = hasHydrated && !isLoading;
  const refetchUser = useCallback(async () => {
    const result = await refetch();
    return result.data ?? null;
  }, [refetch]);

  const value = useMemo(
    () => ({
      user: user ?? null,
      isLoading: !hasHydrated || isLoading,
      isReady,
      refetchUser,
    }),
    [hasHydrated, isLoading, isReady, refetchUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}
