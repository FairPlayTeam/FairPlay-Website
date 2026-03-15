"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User } from "@/lib/users";
import { api } from "@/lib/api";
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

  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery<User | null>({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const res = await api.get<User>("/auth/me");
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          useAuthStore.getState().clearToken();
          return null;
        }
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: hasHydrated,
    retry: false,
  });

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
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
