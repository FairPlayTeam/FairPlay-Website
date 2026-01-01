"use client";

import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/schema";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isReady: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery<User | null>({
    queryKey: ["me"],
    queryFn: () =>
      api.get("/auth/me", { withCredentials: true }).then((res) => res.data),
    refetchOnWindowFocus: false,
    enabled: hasHydrated && !!token,
    retry: false,
  });

  const isReady = hasHydrated && !isLoading;

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: !hasHydrated || isLoading,
        isReady,
        refetchUser: refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
