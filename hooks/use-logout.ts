"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authQueryKeys } from "@/lib/auth/query";
import { clearSessionToken } from "@/lib/auth/session";
import { logoutCurrentSession } from "@/lib/users";

type UseLogoutOptions = {
  onLoggedOut?: () => void;
};

export function useLogout(options: UseLogoutOptions = {}) {
  const { onLoggedOut } = options;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logoutCurrentSession();
    } finally {
      clearSessionToken();
      queryClient.setQueryData(authQueryKeys.currentUser, null);
      onLoggedOut?.();
      router.replace("/login");
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, onLoggedOut, queryClient, router]);

  return {
    logout,
    isLoggingOut,
  };
}
