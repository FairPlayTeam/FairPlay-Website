"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { clearAuthSession, getCurrentUser } from "@/lib/auth/api";
import {
  type ClientAuthStatus,
  resolveClientAuthState,
} from "@/lib/auth/client-auth-state";
import { authQueryKeys } from "@/lib/auth/query";
import type { User } from "@/lib/users";

interface AuthContextType {
  user: User | null;
  status: ClientAuthStatus;
  isLoading: boolean;
  isReady: boolean;
  isUnavailable: boolean;
  errorMessage: string | null;
  refetchUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery<User | null>({
    queryKey: authQueryKeys.currentUser,
    queryFn: async () => {
      try {
        const res = await getCurrentUser();
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          await clearAuthSession().catch(() => undefined);
          return null;
        }

        throw error;
      }
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: false,
  });

  const authState = resolveClientAuthState({
    user,
    isLoading,
    error,
  });

  const refetchUser = useCallback(async () => {
    const result = await refetch();

    if (result.error) {
      throw result.error;
    }

    return result.data ?? null;
  }, [refetch]);

  const value = useMemo(
    () => ({
      ...authState,
      refetchUser,
    }),
    [authState, refetchUser],
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
