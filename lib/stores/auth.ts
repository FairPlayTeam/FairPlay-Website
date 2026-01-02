"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  clearToken: () => void;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        setToken: (token) => set({ token }),
        clearToken: () => set({ token: null }),
        hasHydrated: false,
        setHasHydrated: (value) => set({ hasHydrated: value }),
      }),
      {
        name: "auth-store",
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      }
    )
  )
);
